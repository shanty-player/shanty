/*
  Warnings:

  - A unique constraint covering the columns `[startPlayAt]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "startPlayAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Player_startPlayAt_key" ON "Player"("startPlayAt");
