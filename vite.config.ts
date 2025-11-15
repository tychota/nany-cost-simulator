import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  // Pour GitHub Pages, tu pourras ajuster `base` plus tard, ex:
  // base: "/nom-du-repo/"
});
