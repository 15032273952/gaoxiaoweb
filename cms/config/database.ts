/**
 * 数据库配置文件 - config/database.ts
 * 
 * 功能：根据环境变量配置数据库连接
 * 
 * 支持的数据库：
 * - SQLite（默认，开发环境）
 * - PostgreSQL（生产环境）
 */

import path from "path";

/**
 * 数据库配置函数
 * 
 * @param env - 环境变量读取函数
 * @returns Strapi 数据库配置对象
 */
export default ({ env }: { env: any }) => {
  // 读取数据库类型，默认为 sqlite
  const client = env("DATABASE_CLIENT", "sqlite");

  // PostgreSQL 配置（生产环境）
  if (client === "postgres" || client === "pg") {
    return {
      connection: {
        client: "postgres",  // 使用 postgres 驱动
        connection: {
          host: env("DATABASE_HOST", "localhost"),      // 数据库主机
          port: env.int("DATABASE_PORT", 5432),         // 端口，默认 5432
          database: env("DATABASE_NAME", "strapi"),     // 数据库名
          user: env("DATABASE_USERNAME", "strapi"),     // 用户名
          password: env("DATABASE_PASSWORD", "strapi"), // 密码
          ssl: env.bool("DATABASE_SSL", false),         // 是否启用 SSL
        },
      },
    };
  }

  // 默认 SQLite 配置（开发/POC 环境）
  return {
    connection: {
      client: "sqlite",  // Strapi 5 dialect 名称（底层仍使用 better-sqlite3 驱动）
      connection: {
        // 数据库文件路径：database/data.db
        filename: path.join(__dirname, "..", "..", "database", "data.db"),
      },
      useNullAsDefault: true,  // SQLite 要求
    },
  };
};
