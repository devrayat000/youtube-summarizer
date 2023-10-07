import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "SumTube",
  description: "Summarize YouTube videos in one click",
  author: "Zul Ikram Musaddik Rayat",
  offline_enabled: true,
  version: "1.0.0",
  action: { default_popup: "index.html" },
  permissions: ["tabs", "activeTab"],
  icons: {
    "16": "src/assets/icons/icon16.png",
    "32": "src/assets/icons/icon32.png",
    "48": "src/assets/icons/icon48.png",
    "128": "src/assets/icons/icon128.png",
  },
  // and the api host
  host_permissions: ["*://devrayat000-youtube-summarizer.hf.space/*"],
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      js: ["src/content.tsx"],
      matches: ["https://*.youtube.com/*"],
    },
  ],
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: "package",
  },
});
