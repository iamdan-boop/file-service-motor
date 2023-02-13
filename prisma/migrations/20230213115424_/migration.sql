-- CreateTable
CREATE TABLE `publicfile` (
    `id` VARCHAR(191) NOT NULL,
    `bucketPath` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL DEFAULT '',
    `mimeType` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
