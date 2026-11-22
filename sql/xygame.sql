/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80032
 Source Host           : localhost:3306
 Source Schema         : xygame

 Target Server Type    : MySQL
 Target Server Version : 80032
 File Encoding         : 65001

 Date: 21/11/2026 22:06:06
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activity_state
-- ----------------------------
DROP TABLE IF EXISTS `activity_state`;
CREATE TABLE `activity_state`  (
  `server_id` int NOT NULL DEFAULT 0,
  `config_id` int UNSIGNED NOT NULL DEFAULT 0,
  `activity_id` int UNSIGNED NOT NULL DEFAULT 0,
  `state` int NOT NULL DEFAULT 0,
  `state_begin_time` bigint NOT NULL DEFAULT 0,
  `start_time` bigint NOT NULL DEFAULT 0,
  `end_time` bigint NOT NULL DEFAULT 0,
  `round` int NOT NULL DEFAULT 0,
  `last_window_end` bigint NOT NULL DEFAULT 0,
  `update_time` bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (`server_id`, `config_id`) USING BTREE,
  INDEX `activity_id_INDEX`(`activity_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for arena
-- ----------------------------
DROP TABLE IF EXISTS `arena`;
CREATE TABLE `arena`  (
  `uid` bigint NOT NULL,
  `score` int NOT NULL DEFAULT 1000,
  `data` longblob NULL,
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for chat
-- ----------------------------
DROP TABLE IF EXISTS `chat`;
CREATE TABLE `chat`  (
  `type` int NOT NULL,
  `chat_id` bigint NOT NULL,
  `uid` bigint NOT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `time` bigint NULL DEFAULT NULL,
  `chat_msg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`type`, `chat_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for global_data
-- ----------------------------
DROP TABLE IF EXISTS `global_data`;
CREATE TABLE `global_data`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `data` longblob NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for item_list
-- ----------------------------
DROP TABLE IF EXISTS `item_list`;
CREATE TABLE `item_list`  (
  `id` bigint NOT NULL,
  `uid` bigint UNSIGNED NOT NULL DEFAULT 0,
  `slot_index` int NOT NULL DEFAULT 0,
  `item_id` int NOT NULL DEFAULT 0,
  `num` bigint NOT NULL DEFAULT 0,
  `param` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ROLE_ID_INDEX`(`uid` ASC) USING BTREE,
  INDEX `UID_SLOT_INDEX`(`uid` ASC, `slot_index` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_data
-- ----------------------------
DROP TABLE IF EXISTS `role_data`;
CREATE TABLE `role_data`  (
  `uid` bigint NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varbinary(64) NOT NULL DEFAULT '',
  `level` int NOT NULL DEFAULT 0,
  `exp` bigint NOT NULL DEFAULT 0,
  `last_login_time` bigint NOT NULL DEFAULT 0,
  `base_info` longblob NULL,
  `growth` longblob NULL,
  `mmo` longblob NULL,
  PRIMARY KEY (`uid`) USING BTREE,
  INDEX `role_name_INX`(`name` ASC) USING BTREE,
  INDEX `role_username_INX`(`username` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_login
-- ----------------------------
DROP TABLE IF EXISTS `role_login`;
CREATE TABLE `role_login`  (
  `uid` bigint NOT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `server_id` int NOT NULL DEFAULT 0,
  `role_name` varbinary(64) NOT NULL DEFAULT '',
  `level` int NOT NULL DEFAULT 0,
  `create_time` bigint NOT NULL DEFAULT 0,
  `last_login_time` bigint NOT NULL DEFAULT 0,
  `login_status` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`uid`) USING BTREE,
  UNIQUE INDEX `user_name_UNIQUE`(`user_name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_rank
-- ----------------------------
DROP TABLE IF EXISTS `role_rank`;
CREATE TABLE `role_rank`  (
  `type` int NOT NULL,
  `uid` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `value` bigint NOT NULL,
  `param1` bigint NOT NULL DEFAULT 0,
  `param2` bigint NOT NULL DEFAULT 0,
  `param3` bigint NOT NULL DEFAULT 0,
  `update_time` bigint NOT NULL DEFAULT 0,
  `data` longblob NULL,
  PRIMARY KEY (`type`, `uid`) USING BTREE,
  INDEX `rank_type_idx`(`type` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for server_data
-- ----------------------------
DROP TABLE IF EXISTS `server_data`;
CREATE TABLE `server_data`  (
  `id` bigint NOT NULL,
  `server_begin_timestamp` bigint UNSIGNED NULL DEFAULT NULL,
  `next_month_timestamp` bigint UNSIGNED NULL DEFAULT NULL,
  `next_week_timestamp` bigint UNSIGNED NULL DEFAULT NULL,
  `last_update_dayid` bigint UNSIGNED NULL DEFAULT NULL,
  `server_global_data` longblob NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
