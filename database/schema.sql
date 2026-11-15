-- Schema inicial do template (executado por `php app install`, uma instrução por vez).
-- InnoDB + utf8mb4. Colunas NOT NULL têm DEFAULT para funcionar com o MySQL em modo estrito.

CREATE TABLE IF NOT EXISTS `user_group` (
    `user_group_id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `roles` text NOT NULL,
    PRIMARY KEY (`user_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user` (
    `user_id` int(11) NOT NULL AUTO_INCREMENT,
    `status` varchar(50) NOT NULL DEFAULT 'ativado',
    `user_group_id` int(11) NOT NULL,
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `nickname` varchar(100) NOT NULL DEFAULT '',
    `firstname` varchar(100) NOT NULL DEFAULT '',
    `lastname` varchar(100) NOT NULL DEFAULT '',
    `email` varchar(100) NOT NULL DEFAULT '',
    -- selo de token (Wep\Security\Token): "<sha256>:<expiração>" de recuperação ou senha temporária
    `code` varchar(255) NOT NULL DEFAULT '',
    `profile_image` varchar(255) NOT NULL DEFAULT '',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `user_username` (`username`),
    KEY `user_email` (`email`),
    KEY `user_group` (`user_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_invite` (
    `user_invite_id` int(11) NOT NULL AUTO_INCREMENT,
    `status` varchar(30) NOT NULL DEFAULT 'pending',
    `email` varchar(100) NOT NULL,
    `user_group_id` int(11) NOT NULL,
    `token` varchar(255) NOT NULL,
    `expire_at` datetime NOT NULL,
    PRIMARY KEY (`user_invite_id`),
    UNIQUE KEY `user_invite_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `login_persistent` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `selector` char(32) NOT NULL,
    `token_hash` char(64) NOT NULL,
    `user_id` int(11) NOT NULL,
    `expires_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `login_persistent_selector` (`selector`),
    KEY `login_persistent_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `menu` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL,
    `slug` varchar(60) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `menu_items` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `parent_id` int(11) NOT NULL DEFAULT 0,
    `menu_id` int(11) NOT NULL,
    `title` varchar(100) NOT NULL,
    `icon` varchar(255) NOT NULL DEFAULT '{}',
    `type` varchar(30) NOT NULL DEFAULT '',
    `permission` varchar(30) NOT NULL DEFAULT '',
    `user_groups` varchar(255) NOT NULL DEFAULT '',
    `link` varchar(100) NOT NULL DEFAULT '',
    `external` tinyint(4) NOT NULL DEFAULT 0,
    `sort_order` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `menu_items_menu` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
