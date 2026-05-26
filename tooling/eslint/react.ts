import reactPlugin from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export const reactConfig = defineConfig(
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...reactPlugin.configs.recommended,
    languageOptions: {
      ...reactPlugin.configs.recommended?.languageOptions,
      globals: {
        React: "writable",
      },
    },
    rules: {
      "@eslint-react/component-hook-factories": "off",
      "@eslint-react/no-nested-component-definitions": "warn",
    },
  },
  reactHooks.configs.flat["recommended-latest"]!,
);
