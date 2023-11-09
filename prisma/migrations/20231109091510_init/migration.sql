/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Pemilik` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Admin_email_key` ON `Admin`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Client_email_key` ON `Client`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Pemilik_email_key` ON `Pemilik`(`email`);
