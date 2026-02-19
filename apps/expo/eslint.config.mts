import { defineConfig } from "eslint/config";

import { baseConfig } from "@ioyou/eslint-config/base";
import { reactConfig } from "@ioyou/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
