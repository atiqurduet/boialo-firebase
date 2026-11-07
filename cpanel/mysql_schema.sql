-- ============================================================================
-- Boialo (বইআলো) — Complete MySQL / MariaDB Database Schema & Seed Data
-- Compatible with cPanel phpMyAdmin (MySQL 5.7+ / 8.0+ / MariaDB 10.3+)
-- Charset: utf8mb4 (Full Bengali & Emoji support)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. site_settings
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `setting_key` VARCHAR(191) NOT NULL UNIQUE,
  `setting_value` LONGTEXT DEFAULT NULL,
  `setting_type` VARCHAR(64) DEFAULT 'text',
  `category` VARCHAR(64) DEFAULT 'general',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. navigation_menus
CREATE TABLE IF NOT EXISTS `navigation_menus` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `location` VARCHAR(64) NOT NULL DEFAULT 'header',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. menu_items
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `menu_id` VARCHAR(64) NOT NULL,
  `parent_id` VARCHAR(64) DEFAULT NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `url` VARCHAR(500) NOT NULL,
  `icon` VARCHAR(128) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `open_in_new_tab` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_menu_items_menu` (`menu_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. footer_sections
CREATE TABLE IF NOT EXISTS `footer_sections` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `section_type` VARCHAR(64) NOT NULL DEFAULT 'links',
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `content` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. footer_links
CREATE TABLE IF NOT EXISTS `footer_links` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `section_id` VARCHAR(64) NOT NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `url` VARCHAR(500) NOT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_footer_links_section` (`section_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. banners
CREATE TABLE IF NOT EXISTS `banners` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `image_desktop` VARCHAR(1000) NOT NULL,
  `image_mobile` VARCHAR(1000) DEFAULT NULL,
  `link_url` VARCHAR(500) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `description_bn` TEXT DEFAULT NULL,
  `image_url` VARCHAR(1000) DEFAULT NULL,
  `parent_id` VARCHAR(64) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. writers
CREATE TABLE IF NOT EXISTS `writers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `bio_bn` TEXT DEFAULT NULL,
  `image_url` VARCHAR(1000) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. publishers
CREATE TABLE IF NOT EXISTS `publishers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `description_bn` TEXT DEFAULT NULL,
  `logo_url` VARCHAR(1000) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. products
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title_bn` VARCHAR(500) NOT NULL,
  `title_en` VARCHAR(500) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description_bn` LONGTEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `discount_percent` INT DEFAULT NULL,
  `author` VARCHAR(255) DEFAULT NULL,
  `publisher` VARCHAR(255) DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `preview_pages` JSON DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_bestseller` TINYINT(1) DEFAULT 0,
  `is_new_release` TINYINT(1) DEFAULT 0,
  `is_preorder` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `stock_quantity` INT DEFAULT 0,
  `category_id` VARCHAR(64) DEFAULT NULL,
  `writer_id` VARCHAR(64) DEFAULT NULL,
  `publisher_id` VARCHAR(64) DEFAULT NULL,
  `isbn` VARCHAR(64) DEFAULT NULL,
  `pages` INT DEFAULT NULL,
  `edition` VARCHAR(128) DEFAULT NULL,
  `language` VARCHAR(64) DEFAULT 'বাংলা',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_writer` (`writer_id`),
  INDEX `idx_products_publisher` (`publisher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. homepage_sections
CREATE TABLE IF NOT EXISTS `homepage_sections` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `section_type` VARCHAR(128) NOT NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `subtitle_bn` VARCHAR(500) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `settings` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. product_types
CREATE TABLE IF NOT EXISTS `product_types` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `type_key` VARCHAR(128) NOT NULL UNIQUE,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(128) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. universal_categories
CREATE TABLE IF NOT EXISTS `universal_categories` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `product_type` VARCHAR(128) NOT NULL,
  `image_url` VARCHAR(1000) DEFAULT NULL,
  `parent_id` VARCHAR(64) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. universal_products
CREATE TABLE IF NOT EXISTS `universal_products` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(500) NOT NULL,
  `name_en` VARCHAR(500) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description_bn` LONGTEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `discount_percent` INT DEFAULT NULL,
  `brand` VARCHAR(255) DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `stock_quantity` INT DEFAULT 0,
  `category_id` VARCHAR(64) DEFAULT NULL,
  `product_type` VARCHAR(128) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. payment_methods
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `provider` VARCHAR(128) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `config` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. courier_providers
CREATE TABLE IF NOT EXISTS `courier_providers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `provider` VARCHAR(128) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `config` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. delivery_zones
CREATE TABLE IF NOT EXISTS `delivery_zones` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `charge` DECIMAL(10,2) NOT NULL DEFAULT 60.00,
  `estimated_days` VARCHAR(128) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. profiles
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) DEFAULT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `avatar_url` VARCHAR(1000) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(128) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_number` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(64) NOT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `shipping_address` TEXT NOT NULL,
  `city` VARCHAR(128) DEFAULT NULL,
  `area` VARCHAR(128) DEFAULT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(64) DEFAULT 'cod',
  `payment_status` VARCHAR(64) DEFAULT 'pending',
  `status` VARCHAR(64) DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) DEFAULT NULL,
  `product_title` VARCHAR(500) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. media_library
CREATE TABLE IF NOT EXISTS `media_library` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `url` VARCHAR(1000) NOT NULL,
  `thumbnail_url` VARCHAR(1000) DEFAULT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_filename` VARCHAR(255) DEFAULT NULL,
  `folder` VARCHAR(128) DEFAULT 'general',
  `mime_type` VARCHAR(128) DEFAULT NULL,
  `size_bytes` BIGINT DEFAULT 0,
  `width` INT DEFAULT NULL,
  `height` INT DEFAULT NULL,
  `storage_provider` VARCHAR(64) DEFAULT 'cpanel',
  `uploaded_by` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Generic JSON store for auxiliary tables (coupons, offers, reviews, blog_posts, etc.)
CREATE TABLE IF NOT EXISTS `app_collections` (
  `collection_name` VARCHAR(128) NOT NULL,
  `id` VARCHAR(64) NOT NULL,
  `payload` JSON NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_name`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

INSERT IGNORE INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `category`) VALUES
('1', 'site_name', 'বইআলো', 'text', 'general'),
('2', 'footer_description', 'বাংলাদেশের সবচেয়ে বড় অনলাইন বই ও লাইফস্টাইল শপ। আমরা সেরা মানের বই ও পণ্য দ্রুততম সময়ে পৌঁছে দিই।', 'text', 'general'),
('3', 'copyright_text', '© ২০২৫ বইআলো (Boialo). সর্বস্বত্ব সংরক্ষিত।', 'text', 'general'),
('4', 'pre_header_text', '🎉 সকল বইয়ে ৪০% পর্যন্ত বিশেষ ছাড়! কুপন কোড: BOOK15', 'text', 'general'),
('5', 'pre_header_link', '/offers', 'text', 'general'),
('6', 'pre_header_enabled', 'true', 'boolean', 'general'),
('7', 'header_logo', '', 'text', 'branding'),
('8', 'footer_logo', '', 'text', 'branding'),
('9', 'favicon', '', 'text', 'branding');

INSERT IGNORE INTO `navigation_menus` (`id`, `name`, `slug`, `location`) VALUES
('11111111-1111-4111-8111-111111111111', 'Main Navigation', 'main-nav', 'header');

INSERT IGNORE INTO `menu_items` (`id`, `menu_id`, `parent_id`, `title_bn`, `title_en`, `url`, `sort_order`, `is_active`, `open_in_new_tab`) VALUES
('101', '11111111-1111-4111-8111-111111111111', NULL, 'হোম', 'Home', '/', 1, 1, 0),
('102', '11111111-1111-4111-8111-111111111111', NULL, 'সকল বই', 'All Books', '/shop', 2, 1, 0),
('103', '11111111-1111-4111-8111-111111111111', NULL, 'বিভাগসমূহ', 'Categories', '/categories', 3, 1, 0),
('104', '11111111-1111-4111-8111-111111111111', NULL, 'লেখক', 'Authors', '/authors', 4, 1, 0),
('105', '11111111-1111-4111-8111-111111111111', NULL, 'প্রকাশক', 'Publishers', '/publishers', 5, 1, 0),
('106', '11111111-1111-4111-8111-111111111111', NULL, 'আজকের অফার', 'Today Offers', '/offers', 6, 1, 0),
('107', '11111111-1111-4111-8111-111111111111', NULL, 'ই-বুক', 'E-Books', '/ebooks', 7, 1, 0),
('108', '11111111-1111-4111-8111-111111111111', NULL, 'প্রি-অর্ডার', 'Pre-order', '/preorder', 8, 1, 0);

INSERT IGNORE INTO `footer_sections` (`id`, `title_bn`, `title_en`, `section_type`, `sort_order`, `is_active`, `content`) VALUES
('22222222-2222-4222-8222-222222222201', 'দ্রুত লিংক', 'Quick Links', 'links', 1, 1, '{}'),
('22222222-2222-4222-8222-222222222202', 'বিভাগসমূহ', 'Categories', 'links', 2, 1, '{}'),
('22222222-2222-4222-8222-222222222203', 'যোগাযোগ', 'Contact', 'contact', 3, 1, '{"address": "৬০/এ, পুরানা পল্টন, ঢাকা-১০০০, বাংলাদেশ", "phone": "+৮৮০ ১৭০০-০০০০০০", "email": "help.boialo@gmail.com"}'),
('22222222-2222-4222-8222-222222222204', 'সোশ্যাল মিডিয়া', 'Social Media', 'social', 4, 1, '{"facebook": "https://facebook.com", "youtube": "https://youtube.com", "instagram": "https://instagram.com"}');

INSERT IGNORE INTO `footer_links` (`id`, `section_id`, `title_bn`, `title_en`, `url`, `sort_order`, `is_active`) VALUES
('201', '22222222-2222-4222-8222-222222222201', 'আমাদের সম্পর্কে', 'About Us', '/about', 1, 1),
('202', '22222222-2222-4222-8222-222222222201', 'যোগাযোগ করুন', 'Contact', '/contact', 2, 1),
('203', '22222222-2222-4222-8222-222222222201', 'সাধারণ জিজ্ঞাসা', 'FAQ', '/faq', 3, 1),
('204', '22222222-2222-4222-8222-222222222201', 'শর্তাবলী', 'Terms', '/terms', 4, 1),
('205', '22222222-2222-4222-8222-222222222201', 'গোপনীয়তা নীতি', 'Privacy', '/privacy', 5, 1),
('206', '22222222-2222-4222-8222-222222222202', 'ইসলামি বই', 'Islamic Books', '/categories/islamic', 1, 1),
('207', '22222222-2222-4222-8222-222222222202', 'উপন্যাস ও সাহিত্য', 'Novels', '/categories/novels', 2, 1),
('208', '22222222-2222-4222-8222-222222222202', 'একাডেমিক বই', 'Academic Books', '/categories/academic', 3, 1),
('209', '22222222-2222-4222-8222-222222222202', 'শিশু-কিশোর বই', 'Children Books', '/categories/children', 4, 1),
('210', '22222222-2222-4222-8222-222222222202', 'আত্মউন্নয়ন', 'Self Help', '/categories/self-help', 5, 1);

INSERT IGNORE INTO `banners` (`id`, `title`, `image_desktop`, `image_mobile`, `link_url`, `sort_order`, `is_active`) VALUES
('77777777-7777-4777-8777-777777777701', 'অমর একুশে বইমেলা ও বেস্টসেলার কালেকশন - সর্বোচ্চ ৪০% ছাড়!', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80', '/shop', 1, 1),
('77777777-7777-4777-8777-777777777702', 'ইসলামি ও আত্মউন্নয়নমূলক বইয়ে বিশেষ ফ্ল্যাশ সেল', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80', '/offers', 2, 1);

INSERT IGNORE INTO `categories` (`id`, `name_bn`, `name_en`, `slug`, `image_url`, `parent_id`, `sort_order`, `is_active`) VALUES
('33333333-3333-4333-8333-333333333301', 'ইসলামি বই', 'Islamic Books', 'islamic', 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', NULL, 1, 1),
('33333333-3333-4333-8333-333333333302', 'উপন্যাস ও সাহিত্য', 'Novels & Literature', 'novels', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80', NULL, 2, 1),
('33333333-3333-4333-8333-333333333303', 'একাডেমিক বই', 'Academic Books', 'academic', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80', NULL, 3, 1),
('33333333-3333-4333-8333-333333333304', 'শিশু-কিশোর বই', 'Children Books', 'children', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', NULL, 4, 1),
('33333333-3333-4333-8333-333333333305', 'আত্মউন্নয়ন ও মোটিভেশন', 'Self Help', 'self-help', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80', NULL, 5, 1),
('33333333-3333-4333-8333-333333333306', 'ইতিহাস ও ঐতিহ্য', 'History & Tradition', 'history', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80', NULL, 6, 1),
('33333333-3333-4333-8333-333333333307', 'বিজ্ঞান ও প্রযুক্তি', 'Science & Tech', 'science', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80', NULL, 7, 1),
('33333333-3333-4333-8333-333333333308', 'অনুবাদ সাহিত্য', 'Translated Literature', 'translation', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80', NULL, 8, 1);

INSERT IGNORE INTO `writers` (`id`, `name_bn`, `name_en`, `slug`, `bio_bn`, `image_url`, `sort_order`, `is_active`) VALUES
('44444444-4444-4444-8444-444444444401', 'আরিফ আজাদ', 'Arif Azad', 'arif-azad', 'জনপ্রিয় সমকালীন লেখক ও চিন্তাবিদ।', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 1, 1),
('44444444-4444-4444-8444-444444444402', 'হুমায়ূন আহমেদ', 'Humayun Ahmed', 'humayun-ahmed', 'বাংলা সাহিত্যের নন্দিত কথাসাহিত্যিক।', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 2, 1),
('44444444-4444-4444-8444-444444444403', 'ড. মিজানুর রহমান আজহারী', 'Dr. Mizanur Rahman Azhari', 'mizanur-rahman-azhari', 'বিশিষ্ট ইসলামি গবেষক ও লেখক।', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', 3, 1),
('44444444-4444-4444-8444-444444444404', 'মুহম্মদ জাফর ইকবাল', 'Muhammed Zafar Iqbal', 'muhammed-zafar-iqbal', 'বিজ্ঞান কল্পকাহিনী ও শিশুসাহিত্যিক।', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', 4, 1),
('44444444-4444-4444-8444-444444444405', 'শায়খ আহমাদুল্লাহ', 'Shaykh Ahmadullah', 'shaykh-ahmadullah', 'ইসলামি স্কলার ও লেখক।', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', 5, 1),
('44444444-4444-4444-8444-444444444406', 'রবীন্দ্রনাথ ঠাকুর', 'Rabindranath Tagore', 'rabindranath-tagore', 'বিশ্বকবি ও নোবেলজয়ী সাহিত্যিক।', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80', 6, 1);

INSERT IGNORE INTO `publishers` (`id`, `name_bn`, `name_en`, `slug`, `logo_url`, `sort_order`, `is_active`) VALUES
('55555555-5555-4555-8555-555555555501', 'সমকালীন প্রকাশন', 'Somokalin Prokashon', 'somokalin', NULL, 1, 1),
('55555555-5555-4555-8555-555555555502', 'গার্ডিয়ান পাবলিকেশন্স', 'Guardian Publications', 'guardian', NULL, 2, 1),
('55555555-5555-4555-8555-555555555503', 'প্রথমা প্রকাশন', 'Prothoma Prokashon', 'prothoma', NULL, 3, 1),
('55555555-5555-4555-8555-555555555504', 'অন্যপ্রকাশ', 'Anyaprokash', 'anyaprokash', NULL, 4, 1);

INSERT IGNORE INTO `products` (`id`, `title_bn`, `title_en`, `slug`, `description_bn`, `price`, `original_price`, `discount_percent`, `author`, `publisher`, `images`, `is_featured`, `is_bestseller`, `is_new_release`, `is_preorder`, `is_active`, `stock_quantity`, `category_id`, `writer_id`, `publisher_id`) VALUES
('66666666-6666-4666-8666-666666666601', 'প্যারাডক্সিক্যাল সাজিদ', 'Paradoxical Sajid', 'paradoxical-sajid', 'বিশ্বাস ও অবিশ্বাসের যুক্তিতর্ক নিয়ে রচিত সমকালীন বেস্টসেলার ইসলামি বই।', 240.00, 400.00, 40, 'আরিফ আজাদ', 'গার্ডিয়ান পাবলিকেশন্স', '["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80"]', 1, 1, 0, 0, 1, 50, '33333333-3333-4333-8333-333333333301', '44444444-4444-4444-8444-444444444401', '55555555-5555-4555-8555-555555555502'),
('66666666-6666-4666-8666-666666666602', 'বেলা ফুরাবার আগে', 'Bela Furabar Age', 'bela-furabar-age', 'যুবসমাজের আত্মশুদ্ধি ও জীবনের লক্ষ্য নির্ধারণে অনন্য দিকনির্দেশনামূলক বই।', 270.00, 450.00, 40, 'আরিফ আজাদ', 'সমকালীন প্রকাশন', '["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80"]', 1, 1, 1, 0, 1, 42, '33333333-3333-4333-8333-333333333301', '44444444-4444-4444-8444-444444444401', '55555555-5555-4555-8555-555555555501'),
('66666666-6666-4666-8666-666666666603', 'ম্যাসেজ: আধুনিক মননে দ্বীনের ছোঁয়া', 'Message', 'message-azhari', 'আধুনিক যুগের জীবনঘনিষ্ঠ প্রশ্ন ও ইসলামের শাশ্বত সমাধান নিয়ে রচিত গ্রন্থ।', 300.00, 500.00, 40, 'ড. মিজানুর রহমান আজহারী', 'গার্ডিয়ান পাবলিকেশন্স', '["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80"]', 1, 1, 1, 0, 1, 65, '33333333-3333-4333-8333-333333333301', '44444444-4444-4444-8444-444444444403', '55555555-5555-4555-8555-555555555502'),
('66666666-6666-4666-8666-666666666604', 'হিমু সমগ্র (১ম খণ্ড)', 'Himu Somogro Vol 1', 'himu-somogro-1', 'হুমায়ূন আহমেদের কালজয়ী চরিত্র হিমুর সেরা উপন্যাসগুলোর সংকলন।', 420.00, 600.00, 30, 'হুমায়ূন আহমেদ', 'অন্যপ্রকাশ', '["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80"]', 1, 1, 0, 0, 1, 35, '33333333-3333-4333-8333-333333333302', '44444444-4444-4444-8444-444444444402', '55555555-5555-4555-8555-555555555504'),
('66666666-6666-4666-8666-666666666605', 'অ্যাটমিক হ্যাবিটস (বাংলা অনুবাদ)', 'Atomic Habits (Bengali)', 'atomic-habits-bn', 'ক্ষুদ্র অভ্যাসের ইতিবাচক পরিবর্তনের মাধ্যমে অসাধারণ সাফল্য অর্জনের বিশ্বসেরা বই।', 210.00, 350.00, 40, 'জেমস ক্লিয়ার', 'প্রথমা প্রকাশন', '["https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=80"]', 1, 1, 1, 0, 1, 80, '33333333-3333-4333-8333-333333333305', '44444444-4444-4444-8444-444444444404', '55555555-5555-4555-8555-555555555503'),
('66666666-6666-4666-8666-666666666606', 'নবী জীবনের গল্প', 'Nobi Jiboner Golpo', 'nobi-jiboner-golpo', 'সহজ ও প্রাঞ্জল ভাষায় নবী করীম (সা.)-এর জীবনীর অনুপম বর্ণনা।', 250.00, 420.00, 40, 'শায়খ আহমাদুল্লাহ', 'সমকালীন প্রকাশন', '["https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500&auto=format&fit=crop&q=80"]', 1, 0, 1, 0, 1, 48, '33333333-3333-4333-8333-333333333301', '44444444-4444-4444-8444-444444444405', '55555555-5555-4555-8555-555555555501'),
('66666666-6666-4666-8666-666666666607', 'বিজ্ঞানের একশ মজার খেলা', '100 Fun Science Experiments', 'bigganer-eksho-mojar-khela', 'শিশু-কিশোরদের জন্য হাতে-কলমে বিজ্ঞানের চমৎকার সব পরীক্ষণ।', 180.00, 300.00, 40, 'মুহম্মদ জাফর ইকবাল', 'প্রথমা প্রকাশন', '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80"]', 0, 1, 1, 0, 1, 60, '33333333-3333-4333-8333-333333333304', '44444444-4444-4444-8444-444444444404', '55555555-5555-4555-8555-555555555503'),
('66666666-6666-4666-8666-666666666608', 'গীতাঞ্জলি ও নির্বাচিত কবিতা', 'Gitanjali & Selected Poems', 'gitanjali-selected-poems', 'রবীন্দ্রনাথ ঠাকুরের নোবেলজয়ী কাব্যগ্রন্থ ও কালজয়ী কবিতাসমূহ।', 220.00, 320.00, 31, 'রবীন্দ্রনাথ ঠাকুর', 'অন্যপ্রকাশ', '["https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80"]', 1, 0, 1, 0, 1, 40, '33333333-3333-4333-8333-333333333302', '44444444-4444-4444-8444-444444444406', '55555555-5555-4555-8555-555555555504');

INSERT IGNORE INTO `homepage_sections` (`id`, `section_type`, `title_bn`, `title_en`, `subtitle_bn`, `sort_order`, `is_active`, `settings`) VALUES
('88888888-8888-4888-8888-888888888801', 'flash_sale', 'ফ্ল্যাশ সেল', 'Flash Sale', 'সর্বোচ্চ ছাড়', 1, 1, '{"min_discount": 30, "limit": 8}'),
('88888888-8888-4888-8888-888888888802', 'category_grid', 'জনপ্রিয় ক্যাটাগরি', 'Popular Categories', 'সব ধরনের বই এক জায়গায়', 2, 1, '{"columns": 4}'),
('88888888-8888-4888-8888-888888888803', 'new_releases', 'নতুন প্রকাশিত বই', 'New Releases', 'সদ্য প্রকাশিত বইসমূহ', 3, 1, '{"limit": 8}'),
('88888888-8888-4888-8888-888888888804', 'bestsellers', 'বইমেলা বেস্টসেলার', 'Bestsellers', 'সবচেয়ে জনপ্রিয় বইসমূহ', 4, 1, '{"limit": 8}'),
('88888888-8888-4888-8888-888888888805', 'top_authors', 'জনপ্রিয় লেখকবৃন্দ', 'Top Authors', 'পাঠকপ্রিয় লেখকদের বই', 5, 1, '{"limit": 6}'),
('88888888-8888-4888-8888-888888888806', 'promo_banner', 'প্রমোশনাল ব্যানার', 'Promo Banner', 'বিশেষ অফার', 6, 1, '{"title": "প্রিমিয়াম বুকমার্ক ফ্রি!", "description": "৪৯৯+ টাকার অর্ডারে ক্যালিগ্রাফি বুকমার্ক ফ্রি!", "button_text": "এখনই কিনুন", "button_link": "/shop", "badge_text": "সীমিত সময়ের অফার"}'),
('88888888-8888-4888-8888-888888888807', 'recommended', 'আপনার জন্য সুপারিশকৃত', 'Recommended For You', 'আপনার পছন্দ অনুযায়ী', 7, 1, '{"limit": 8}'),
('88888888-8888-4888-8888-888888888808', 'trust_badges', 'কেন আমাদের থেকে কিনবেন', 'Why Choose Us', NULL, 8, 1, '{}'),
('88888888-8888-4888-8888-888888888809', 'newsletter', 'নিউজলেটার', 'Newsletter', NULL, 9, 1, '{}');

INSERT IGNORE INTO `product_types` (`id`, `type_key`, `name_bn`, `name_en`, `icon`, `sort_order`, `is_active`) VALUES
('99999999-9999-4999-8999-999999999901', 'electronics', 'ইলেকট্রনিক্স', 'Electronics', 'Cpu', 1, 1),
('99999999-9999-4999-8999-999999999902', 'stationery', 'স্টেশনারি', 'Stationery', 'PenTool', 2, 1),
('99999999-9999-4999-8999-999999999903', 'lifestyle', 'লাইফস্টাইল ও আতর', 'Lifestyle', 'Sparkles', 3, 1);

INSERT IGNORE INTO `universal_categories` (`id`, `name_bn`, `name_en`, `slug`, `product_type`, `sort_order`, `is_active`) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'নোটবুক ও ডায়েরি', 'Notebooks & Diaries', 'notebooks', 'stationery', 1, 1),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', 'প্রিমিয়াম আতর', 'Premium Attar', 'attar', 'lifestyle', 2, 1);

INSERT IGNORE INTO `payment_methods` (`id`, `name_bn`, `name_en`, `provider`, `is_active`, `sort_order`, `config`) VALUES
('pay-1', 'ক্যাশ অন ডেলিভারি', 'Cash on Delivery', 'cod', 1, 1, '{}'),
('pay-2', 'বিকাশ পেমেন্ট', 'bKash', 'bkash', 1, 2, '{}'),
('pay-3', 'নগদ পেমেন্ট', 'Nagad', 'nagad', 1, 3, '{}');

INSERT IGNORE INTO `courier_providers` (`id`, `name_bn`, `name_en`, `provider`, `is_active`, `sort_order`, `config`) VALUES
('cour-1', 'পাঠাও কুরিয়ার', 'Pathao Courier', 'pathao', 1, 1, '{}'),
('cour-2', 'স্টেডফাস্ট কুরিয়ার', 'Steadfast Courier', 'steadfast', 1, 2, '{}');

INSERT IGNORE INTO `delivery_zones` (`id`, `name_bn`, `name_en`, `charge`, `estimated_days`, `is_active`, `sort_order`) VALUES
('zone-1', 'ঢাকা সিটি', 'Inside Dhaka', 60.00, '১-২ দিন', 1, 1),
('zone-2', 'ঢাকার বাইরে', 'Outside Dhaka', 110.00, '৩-৫ দিন', 1, 2);

SET FOREIGN_KEY_CHECKS = 1;
