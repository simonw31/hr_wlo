/*
  Warnings:

  - You are about to drop the column `employeeId` on the `AvailabilityInterval` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employmentType` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `overtime` on the `TimeRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matricule]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractId` to the `AvailabilityInterval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TimeRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('EN_CONTRAT', 'DEMISSION', 'AUTRE');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Homme', 'Femme');

-- DropForeignKey
ALTER TABLE "AvailabilityInterval" DROP CONSTRAINT "AvailabilityInterval_employeeId_fkey";

-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "AvailabilityInterval" DROP COLUMN "employeeId",
ADD COLUMN     "contractId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "email",
DROP COLUMN "employmentType",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "role",
DROP COLUMN "salary",
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "bic" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'Non défini',
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'Non défini',
ADD COLUMN     "matricule" INTEGER,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "socialSecurityNumber" TEXT,
ADD COLUMN     "transportMeans" TEXT;

-- AlterTable
ALTER TABLE "TimeRecord" DROP COLUMN "overtime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contractType" TEXT,
    "role" TEXT,
    "hoursPerWeek" INTEGER,
    "status" "ContractStatus",
    "resignationDate" TIMESTAMP(3),
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_employeeId_key" ON "Contract"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_matricule_key" ON "Employee"("matricule");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityInterval" ADD CONSTRAINT "AvailabilityInterval_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
