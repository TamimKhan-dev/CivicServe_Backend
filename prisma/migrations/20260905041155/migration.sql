/*
  Warnings:

  - The values [COMPLAINT] on the enum `RequestType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestType_new" AS ENUM ('COMPLAINT_REQUEST', 'SERVICE_REQUEST');
ALTER TABLE "public"."requests" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "requests" ALTER COLUMN "type" TYPE "RequestType_new" USING ("type"::text::"RequestType_new");
ALTER TYPE "RequestType" RENAME TO "RequestType_old";
ALTER TYPE "RequestType_new" RENAME TO "RequestType";
DROP TYPE "public"."RequestType_old";
ALTER TABLE "requests" ALTER COLUMN "type" SET DEFAULT 'COMPLAINT_REQUEST';
COMMIT;

-- AlterTable
ALTER TABLE "requests" ALTER COLUMN "type" SET DEFAULT 'COMPLAINT_REQUEST';
