import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import OMT from "@surma/rollup-plugin-off-main-thread";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts", // 入口文件
  output: {
    dir: "dist", // 输出目录，Rollup 会生成多个 chunk
    format: "esm", // ES 模块
    sourcemap: true,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      browser: true,
      extensions: ["ts"],
    }),
    commonjs(),
    json({
      preferConst: true,
      compact: true,
    }),
    typescript({
      tsconfig: "../tsconfig.json",
      exclude: ["../analysis-platform", "server", "../../example"],
    }),
    OMT(),
    terser(), // 生产环境压缩
  ],
  external: [], // 排除外部依赖
};
