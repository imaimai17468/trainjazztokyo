import { defineConfig, type Plugin } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

const CLIENT_ONLY_MODULES = [
  "maplibre-gl",
  "spessasynth_lib",
  "spessasynth_core",
  "maplibre-gl/dist/maplibre-gl.css",
];

function ssrStubPlugin(): Plugin {
  return {
    name: "ssr-stub-client-modules",
    enforce: "pre",
    resolveId: {
      handler(id) {
        if (this.environment?.name !== "ssr") return;
        if (CLIENT_ONLY_MODULES.some((m) => id === m || id.startsWith(`${m}/`))) {
          return `\0ssr-stub:${id}`;
        }
        if (id.includes("tokyo-railway") || id.includes("tokyo-stations")) {
          return "\0ssr-stub:json-data";
        }
      },
    },
    load: {
      handler(id) {
        if (!id.startsWith("\0ssr-stub:")) return;
        if (id === "\0ssr-stub:json-data") {
          return "export default { lines: { features: [] } }";
        }
        if (id.includes(".css")) {
          return "";
        }
        return "export default {}; export const WorkletSynthesizer = class {};";
      },
    },
  };
}

export default defineConfig({
  plugins: [
    ssrStubPlugin(),
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
  server: {
    allowedHosts: true,
  },
});
