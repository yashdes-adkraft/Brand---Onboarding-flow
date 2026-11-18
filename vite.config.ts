import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:prototype` inlines everything into one HTML file for sharing.
export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss(), ...(mode === "prototype" ? [viteSingleFile()] : [])],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    build: mode === "prototype" ? { outDir: "dist-prototype", assetsInlineLimit: 100_000_000 } : undefined,
}));
