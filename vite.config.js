import { defineConfig } from "vite";

// Root on Fly; project path on GitHub Pages
const isPages = process.env.GITHUB_PAGES === "1";
export default defineConfig({
  base: isPages ? "/sweet-screw-puzzle/" : "/",
});
