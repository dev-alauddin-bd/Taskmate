import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const log = await prisma.activityLog.create({
        data: {
            action: body.action,
            userId: session.user.id,
            projectId: body.projectId,
            taskId: body.taskId,
            details: body.details,
        },
    });

    return Response.json(log);
}