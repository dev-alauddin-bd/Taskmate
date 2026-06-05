import { PrismaPg } from "@prisma/adapter-pg"; 

import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient; 
}; 

const rawUrl = process.env.DATABASE_URL || "";
const connectionString = rawUrl.includes("sslmode=") ? rawUrl : `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}sslmode=verify-full`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);


const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
  }); 

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 

export default prisma; 