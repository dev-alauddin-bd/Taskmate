/*
  Warnings:

  - You are about to drop the column `entityId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `ActivityLog` table. All the data in the column will be lost.
  - Changed the type of `action` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_COMPLETED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED');

-- DropIndex
DROP INDEX "ActivityLog_entityType_idx";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "entityId",
DROP COLUMN "entityType",
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "taskId" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" "ActivityAction" NOT NULL;

-- CreateIndex
CREATE INDEX "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");

-- CreateIndex
CREATE INDEX "ActivityLog_taskId_idx" ON "ActivityLog"("taskId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Project_managerId_idx" ON "Project"("managerId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
