/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";
