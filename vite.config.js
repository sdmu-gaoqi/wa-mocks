import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: true,
    lib: {
      entry: "./lib/main.js",
      name: "mock",
      fileName: "mock",
    },
  },
});
