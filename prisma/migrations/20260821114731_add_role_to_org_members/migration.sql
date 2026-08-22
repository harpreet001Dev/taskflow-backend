-- CreateEnum
CREATE TYPE "Role" AS ENUM ('org_admin', 'member');

-- AlterTable
ALTER TABLE "org_members" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'member';
