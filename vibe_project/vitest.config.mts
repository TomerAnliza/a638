import { defineConfig } from "vitest/config";

// לוגיקת המשחק טהורה (ללא DOM), לכן הסביבה היא node ואין צורך ב-jsdom.
// resolve.tsconfigPaths מאפשר לייבא עם הכינוי "@/..." גם בבדיקות.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
