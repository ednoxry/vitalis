import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "playwright-report/**",
      "test-results/**",
      "legacy/**",
      "next-env.d.ts",
    ],
  },
  {
    // Ponte de migração: JS vanilla herdado do site estático.
    files: ["lib/interactions.js", "lib/tooth3d.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-empty": "off",
      "no-cond-assign": "off",
    },
  },
];

export default eslintConfig;
