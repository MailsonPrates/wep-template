-- Atualização de apps instalados com a 2.0.0 para a 2.0.1 (rodar uma vez no banco do app).
-- Instalações novas já criam tudo pelo database/schema.sql.

-- Admin > Grupo de usuários: rota inicial do grupo
ALTER TABLE `user_group`
    ADD COLUMN `home_role` varchar(100) NOT NULL DEFAULT 'page.home' AFTER `roles`;

-- Config > Visual: cores e logo
CREATE TABLE IF NOT EXISTS `setting` (
    `name` varchar(60) NOT NULL,
    `value` text NOT NULL,
    PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
