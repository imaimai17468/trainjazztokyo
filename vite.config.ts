import { defineConfig } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    solidStart(),
    tailwindcss(),
    nitro({
      preset: "cloudflare-pages",
      compatibilityDate: "2024-11-19",
      compatibilityFlags: ["nodejs_compat"],
    }),
  ],
  server: {
    allowedHosts: true,
  },
});
