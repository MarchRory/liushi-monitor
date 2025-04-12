import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    plugins: [
      react(),
      // @ts-ignore
      tailwindcss()
    ],
    resolve: {
      alias: [
        {
          find: "@/",
          replacement: "/src/",
        },
      ],
    },
    server: {
      hmr: true,
      open: true,
    },
    build: {
      outDir: "dist", // 指定打包路径，默认为项目根目录下的 dist 目录
      // sourcemap: env.VITE_BUILD_SOURCEMAP === "true",
      // minify默认esbuild，esbuild模式下terserOptions将失效
      minify: "terser",
      terserOptions: {
        compress: {
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          drop_console: true,
          drop_debugger: true, // 去除 debugger
        },
      },
      chunkSizeWarningLimit: 1000, // chunk 大小警告的限制（以 kbs 为单位）
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 静态资源拆分
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },
    },
  });
};
