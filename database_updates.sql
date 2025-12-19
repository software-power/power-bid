CREATE TABLE IF NOT EXISTS `attachment_type` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `account_id` BIGINT NOT NULL,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `certificates_attachment` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `account_id` BIGINT NOT NULL,
  `attach_type` BIGINT NOT NULL,
  `certificate_number` VARCHAR(100),
  `file_path` VARCHAR(255) NOT NULL,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `type` enum('buyer','seller','admin') NOT NULL,
  `role_id` varchar(100) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `tin_no` varchar(55) DEFAULT NULL,
  `business_licence` varchar(55) DEFAULT NULL,
  `main_account_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
);

CREATE TABLE IF NOT EXISTS `tenders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `account_id` BIGINT NOT NULL,
  `created_by` BIGINT NOT NULL,
  `status` ENUM('draft','published','closed') DEFAULT 'draft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tender_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `tender_id` BIGINT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100),
  `country_of_origin` VARCHAR(100),
  `strength` VARCHAR(100),
  `unit_of_measure` VARCHAR(50),
  `qty` INT NOT NULL,
  `allow_alternative` TINYINT(1) DEFAULT 0,
  `account_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tender_id`) REFERENCES `tenders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tender_invitations` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `tender_id` BIGINT NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `invitation_token` VARCHAR(255) NOT NULL,
  `required_documents` TEXT,
  `status` ENUM('sent','opened','responded') DEFAULT 'sent',
  `account_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tender_id`) REFERENCES `tenders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Seller Quotations Table
CREATE TABLE IF NOT EXISTS seller_quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    invitation_id INT NOT NULL,
    seller_account_id INT NOT NULL,
    submitted_by INT NOT NULL,
    delivery_period VARCHAR(100),
    remarks TEXT,
    status ENUM('draft', 'submitted', 'accepted', 'rejected') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS seller_quotation_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    tender_item_id INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) GENERATED ALWAYS AS (unit_price - (unit_price * discount_percent / 100)) STORED,
    alternative_brand VARCHAR(100),
    alternative_origin VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seller Quotation Documents Table
CREATE TABLE IF NOT EXISTS seller_quotation_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buyer Item Selections Table
CREATE TABLE IF NOT EXISTS buyer_item_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    tender_item_id INT NOT NULL,
    selected_quotation_id INT NOT NULL,
    selected_by INT NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
