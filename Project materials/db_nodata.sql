/*
 Navicat MySQL Data Transfer

 Source Server         : nineyards.mysql.database.azure.com
 Source Server Type    : MySQL
 Source Server Version : 80021
 Source Host           : nineyards.mysql.database.azure.com:3306
 Source Schema         : db2

 Target Server Type    : MySQL
 Target Server Version : 80021
 File Encoding         : 65001

 Date: 21/11/2021 13:32:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for auth_user
-- ----------------------------
DROP TABLE IF EXISTS `auth_user`;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of auth_user
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for django_migrations
-- ----------------------------
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of django_migrations
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for django_session
-- ----------------------------
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of django_session
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_action
-- ----------------------------
DROP TABLE IF EXISTS `pro_action`;
CREATE TABLE `pro_action` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `start_date` date NOT NULL,
  `due_date` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `milestone` varchar(100) DEFAULT NULL,
  `category_id` int NOT NULL,
  `job_id` int NOT NULL,
  `phase_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pro_action_category_id_ebf0321a_fk_pro_category_id` (`category_id`),
  KEY `pro_action_job_id_63e9a32c_fk_pro_job_id` (`job_id`),
  KEY `pro_action_phase_id_ded249b3_fk_pro_phase_id` (`phase_id`),
  CONSTRAINT `pro_action_category_id_ebf0321a_fk_pro_category_id` FOREIGN KEY (`category_id`) REFERENCES `pro_category` (`id`),
  CONSTRAINT `pro_action_job_id_63e9a32c_fk_pro_job_id` FOREIGN KEY (`job_id`) REFERENCES `pro_job` (`id`),
  CONSTRAINT `pro_action_phase_id_ded249b3_fk_pro_phase_id` FOREIGN KEY (`phase_id`) REFERENCES `pro_phase` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_action
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_actionmember
-- ----------------------------
DROP TABLE IF EXISTS `pro_actionmember`;
CREATE TABLE `pro_actionmember` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_id` int NOT NULL,
  `person_in_charge_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pro_actionmember_action_id_ad3f7b2f_fk_pro_action_id` (`action_id`),
  KEY `pro_actionmember_person_in_charge_id_c49bcf05_fk_auth_user_id` (`person_in_charge_id`),
  CONSTRAINT `pro_actionmember_action_id_ad3f7b2f_fk_pro_action_id` FOREIGN KEY (`action_id`) REFERENCES `pro_action` (`id`),
  CONSTRAINT `pro_actionmember_person_in_charge_id_c49bcf05_fk_auth_user_id` FOREIGN KEY (`person_in_charge_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_actionmember
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_category
-- ----------------------------
DROP TABLE IF EXISTS `pro_category`;
CREATE TABLE `pro_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_category
-- ----------------------------
BEGIN;
INSERT INTO `pro_category` VALUES (1, 'BRIEFINGS');
INSERT INTO `pro_category` VALUES (2, 'FINANCIAL');
INSERT INTO `pro_category` VALUES (3, 'PRODUCTION');
COMMIT;

-- ----------------------------
-- Table structure for pro_comment
-- ----------------------------
DROP TABLE IF EXISTS `pro_comment`;
CREATE TABLE `pro_comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` longtext NOT NULL,
  `date` date NOT NULL,
  `action_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pro_comment_action_id_238739e7_fk_pro_action_id` (`action_id`),
  KEY `pro_comment_user_id_da0c114d_fk_auth_user_id` (`user_id`),
  CONSTRAINT `pro_comment_action_id_238739e7_fk_pro_action_id` FOREIGN KEY (`action_id`) REFERENCES `pro_action` (`id`),
  CONSTRAINT `pro_comment_user_id_da0c114d_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_comment
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_job
-- ----------------------------
DROP TABLE IF EXISTS `pro_job`;
CREATE TABLE `pro_job` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_job
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_jobclient
-- ----------------------------
DROP TABLE IF EXISTS `pro_jobclient`;
CREATE TABLE `pro_jobclient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `job_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pro_jobclient_client_id_4c3deb22_fk_auth_user_id` (`client_id`),
  KEY `pro_jobclient_job_id_b3029845_fk_pro_job_id` (`job_id`),
  CONSTRAINT `pro_jobclient_client_id_4c3deb22_fk_auth_user_id` FOREIGN KEY (`client_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `pro_jobclient_job_id_b3029845_fk_pro_job_id` FOREIGN KEY (`job_id`) REFERENCES `pro_job` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_jobclient
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_jobmanager
-- ----------------------------
DROP TABLE IF EXISTS `pro_jobmanager`;
CREATE TABLE `pro_jobmanager` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `manager_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pro_jobmanager_job_id_8296a150_fk_pro_job_id` (`job_id`),
  KEY `pro_jobmanager_manager_id_529a8a4d_fk_auth_user_id` (`manager_id`),
  CONSTRAINT `pro_jobmanager_job_id_8296a150_fk_pro_job_id` FOREIGN KEY (`job_id`) REFERENCES `pro_job` (`id`),
  CONSTRAINT `pro_jobmanager_manager_id_529a8a4d_fk_auth_user_id` FOREIGN KEY (`manager_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_jobmanager
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_phase
-- ----------------------------
DROP TABLE IF EXISTS `pro_phase`;
CREATE TABLE `pro_phase` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_phase
-- ----------------------------
BEGIN;
INSERT INTO `pro_phase` VALUES (1, 'Planning');
INSERT INTO `pro_phase` VALUES (2, 'Design and creation');
INSERT INTO `pro_phase` VALUES (3, 'Production');
INSERT INTO `pro_phase` VALUES (4, 'Delivery and invoicing');
COMMIT;

-- ----------------------------
-- Table structure for pro_templateaction
-- ----------------------------
DROP TABLE IF EXISTS `pro_templateaction`;
CREATE TABLE `pro_templateaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `due_date` date DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `person_in_charge_id` int DEFAULT NULL,
  `phase_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pro_templateaction_category_id_006fe18b_fk_pro_category_id` (`category_id`),
  KEY `pro_templateaction_person_in_charge_id_6c8b06af_fk_auth_user_id` (`person_in_charge_id`),
  KEY `pro_templateaction_phase_id_659293a2_fk_pro_phase_id` (`phase_id`),
  CONSTRAINT `pro_templateaction_category_id_006fe18b_fk_pro_category_id` FOREIGN KEY (`category_id`) REFERENCES `pro_category` (`id`),
  CONSTRAINT `pro_templateaction_person_in_charge_id_6c8b06af_fk_auth_user_id` FOREIGN KEY (`person_in_charge_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `pro_templateaction_phase_id_659293a2_fk_pro_phase_id` FOREIGN KEY (`phase_id`) REFERENCES `pro_phase` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_templateaction
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for pro_userprofile
-- ----------------------------
DROP TABLE IF EXISTS `pro_userprofile`;
CREATE TABLE `pro_userprofile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `usertype` varchar(20) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `pro_userprofile_user_id_b6080c39_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of pro_userprofile
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
