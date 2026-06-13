import { defineConfig } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    solidStart(),
    tailwindcss(),
    nitro({
      preset: "cloudflare_module",
      compatibilityDate: "2024-09-23",
      minify: false,
      rollupConfig: {
        external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
      },
    }),
  ],
  ssr: {
    noExternal: [],
    external: ["maplibre-gl", "spessasynth_lib", "spessasynth_core"],
  },
  server: {
    allowedHosts: true,
  },
});
