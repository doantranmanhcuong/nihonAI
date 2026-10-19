-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `firebaseUid` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `targetLevel` VARCHAR(191) NOT NULL DEFAULT 'N5',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_firebaseUid_key`(`firebaseUid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kanjis` (
    `id` VARCHAR(191) NOT NULL,
    `character` VARCHAR(191) NOT NULL,
    `hanViet` VARCHAR(191) NOT NULL,
    `strokeCount` INTEGER NOT NULL,
    `jlptLevel` VARCHAR(191) NOT NULL DEFAULT 'N5',
    `onyomi` VARCHAR(191) NOT NULL,
    `kunyomi` VARCHAR(191) NOT NULL,
    `meaningVi` VARCHAR(191) NOT NULL,
    `radicals` VARCHAR(191) NOT NULL,
    `svgPathData` LONGTEXT NOT NULL,
    `mnemonicAi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `kanjis_character_key`(`character`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `decks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cards` (
    `id` VARCHAR(191) NOT NULL,
    `deckId` VARCHAR(191) NOT NULL,
    `kanji` VARCHAR(191) NULL,
    `hiragana` VARCHAR(191) NOT NULL,
    `meaning` VARCHAR(191) NOT NULL,
    `exampleJp` TEXT NULL,
    `exampleVi` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_progress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `repetitions` INTEGER NOT NULL DEFAULT 0,
    `easeFactor` DOUBLE NOT NULL DEFAULT 2.5,
    `interval` INTEGER NOT NULL DEFAULT 1,
    `lastReview` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nextReviewDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'LEARNING',

    INDEX `card_progress_userId_nextReviewDate_idx`(`userId`, `nextReviewDate`),
    UNIQUE INDEX `card_progress_userId_cardId_key`(`userId`, `cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `sourceUrl` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `audioUrl` VARCHAR(191) NULL,
    `rawContent` LONGTEXT NOT NULL,
    `parsedJson` LONGTEXT NOT NULL,
    `translation` LONGTEXT NOT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'N4',
    `publishedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `news_articles_sourceUrl_key`(`sourceUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grammar_cache` (
    `id` VARCHAR(191) NOT NULL,
    `sentenceHash` VARCHAR(191) NOT NULL,
    `sentence` TEXT NOT NULL,
    `parsedTree` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `grammar_cache_sentenceHash_key`(`sentenceHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `decks` ADD CONSTRAINT `decks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_deckId_fkey` FOREIGN KEY (`deckId`) REFERENCES `decks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_progress` ADD CONSTRAINT `card_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_progress` ADD CONSTRAINT `card_progress_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
