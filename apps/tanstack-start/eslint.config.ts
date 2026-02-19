import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@ioyou/eslint-config/base";
import { reactConfig } from "@ioyou/eslint-config/react";

export default defineConfig(
  {
    ignores: [".nitro/**", ".output/**", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  restrictEnvAccess,
);
