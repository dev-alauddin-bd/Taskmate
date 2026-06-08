// src/app/api/tasks/[id]/attachments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (expects env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert the uploaded file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary (auto-detect resource type, store under "attachments" folder)
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "attachments" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(buffer);
    });

    const fileUrl = uploadResult.secure_url; // URL to the uploaded asset

    // Persist attachment metadata in the DB
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        fileUrl,
        taskId,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    // Return the error message if available, otherwise generic message
    const message = error?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}