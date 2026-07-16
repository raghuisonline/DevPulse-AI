import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.LIBSQL_DATABASE_URL ?? "file:./mock.db",
  },
});
