import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/core/src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
