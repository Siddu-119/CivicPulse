-- ==============================================================================
-- CivicPulse V2 — Production Database Schema
-- Fully Compatible with TiDB Cloud Serverless & MySQL 8
-- ==============================================================================
-- Note: Spring Boot JPA automatically initializes or updates tables when
-- spring.jpa.hibernate.ddl-auto=update.
-- This script is provided for manual execution via TiDB Cloud SQL Console
-- or custom migrations if preferred.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `civicpulse` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `civicpulse`;

-- ------------------------------------------------------------------------------
-- Session Configuration for Safe Script Execution
-- ------------------------------------------------------------------------------
SET NAMES utf8mb4;

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(25) DEFAULT NULL,
    `ward` VARCHAR(120) DEFAULT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'CITIZEN',
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    UNIQUE KEY `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: complaints
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tracking_code` VARCHAR(32) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(32) NOT NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(25) NOT NULL DEFAULT 'SUBMITTED',
    `address` VARCHAR(255) NOT NULL,
    `landmark` VARCHAR(160) DEFAULT NULL,
    `ward` VARCHAR(120) DEFAULT NULL,
    `latitude` DOUBLE DEFAULT NULL,
    `longitude` DOUBLE DEFAULT NULL,
    `image_path` VARCHAR(255) DEFAULT NULL,
    `citizen_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    CONSTRAINT `fk_complaints_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `users` (`id`),
    UNIQUE KEY `idx_complaints_tracking_code` (`tracking_code`),
    INDEX `idx_complaints_status` (`status`),
    INDEX `idx_complaints_category` (`category`),
    INDEX `idx_complaints_citizen` (`citizen_id`),
    INDEX `idx_complaints_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: assignments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assignments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `complaint_id` BIGINT NOT NULL,
    `department` VARCHAR(140) NOT NULL,
    `team_name` VARCHAR(140) NOT NULL,
    `officer_name` VARCHAR(120) DEFAULT NULL,
    `officer_contact` VARCHAR(40) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `assigned_by_id` BIGINT DEFAULT NULL,
    `assigned_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    CONSTRAINT `fk_assignments_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_assignments_admin` FOREIGN KEY (`assigned_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    UNIQUE KEY `idx_assignments_complaint` (`complaint_id`),
    INDEX `idx_assignments_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: complaint_updates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complaint_updates` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `complaint_id` BIGINT NOT NULL,
    `status` VARCHAR(25) NOT NULL,
    `remark` TEXT NOT NULL,
    `updated_by_id` BIGINT DEFAULT NULL,
    `updated_by_name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME NOT NULL,
    CONSTRAINT `fk_updates_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_updates_user` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_updates_complaint` (`complaint_id`),
    INDEX `idx_updates_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: feedback
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedback` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `complaint_id` BIGINT NOT NULL,
    `citizen_id` BIGINT NOT NULL,
    `rating` INT NOT NULL,
    `comment` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL,
    CONSTRAINT `fk_feedback_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_feedback_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `users` (`id`),
    UNIQUE KEY `idx_feedback_complaint` (`complaint_id`),
    INDEX `idx_feedback_citizen` (`citizen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `complaint_id` BIGINT DEFAULT NULL,
    `title` VARCHAR(160) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(40) NOT NULL DEFAULT 'STATUS_UPDATE',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notifications_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
    INDEX `idx_notifications_user` (`user_id`),
    INDEX `idx_notifications_read` (`is_read`),
    INDEX `idx_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Verification
-- ------------------------------------------------------------------------------
-- Verification Query: Lists all 6 tables created in `civicpulse`
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'civicpulse';
