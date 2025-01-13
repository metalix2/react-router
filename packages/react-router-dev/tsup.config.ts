import * as fsp from "fs/promises";

import { defineConfig } from "tsup";

// @ts-ignore - out of scope
import { createBanner } from "../../build.utils.js";

import pkg from "./package.json";

const entry = [
  "cli/index.ts",
  "config.ts",
  "routes.ts",
  "vite.ts",
  "vite/cloudflare.ts",
];

const external = [
  "./static/refresh-utils.cjs",
  /\/module-sync-enabled\/index.mjs$/,
  /\.json$/,
];

export default defineConfig([
  {
    clean: true,
    entry,
    format: ["cjs"],
    outDir: "dist",
    dts: true,
    external,
    banner: {
      js: createBanner(pkg.name, pkg.version),
    },
    plugins: [
      {
        name: "copy",
        async buildEnd() {
          await fsp.mkdir("dist/static", { recursive: true });
          await fsp.copyFile(
            "vite/static/refresh-utils.cjs",
            "dist/static/refresh-utils.cjs"
          );

          ["defaults", "module-sync-enabled"].forEach(async (dir) => {
            await fsp.mkdir(`dist/config/${dir}`, { recursive: true });
            const files = await fsp.readdir(`config/${dir}`);
            for (const file of files) {
              await fsp.copyFile(
                `config/${dir}/${file}`,
                `dist/config/${dir}/${file}`
              );
            }
          });
        },
      },
    ],
  },
]);
