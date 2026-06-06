import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    { enforce: "pre", ...mdx() },
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});
