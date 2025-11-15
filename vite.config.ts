import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const base = process.env.GITHUB_ACTIONS ? "/nany-cost-simulator/" : "/";

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: "dist",
  },
});
