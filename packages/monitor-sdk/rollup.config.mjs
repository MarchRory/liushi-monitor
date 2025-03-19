import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts", // 入口文件
  output: [
    {
      file: "dist/index.esm.js",
      format: "esm", // ES 模块
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs", // CommonJS
    },
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
      browser: true,
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
    terser(), // 生产环境压缩
  ],
  external: [], // 排除外部依赖
};
