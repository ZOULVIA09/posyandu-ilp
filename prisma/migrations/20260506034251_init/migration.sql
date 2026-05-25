-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BIDAN', 'KADER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "posyanduId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posyandu" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,

    CONSTRAINT "Posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
