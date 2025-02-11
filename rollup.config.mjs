import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
const pkg = process.env.TARGET;

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const resolve = (p) => {
  return path.resolve(`${__dirname}/packages/${pkg}`, p);
};

const { buildOptions } = require(resolve("package.json"));

const formatMap = {
  esm: {
    file: resolve(`dist/${pkg}.esm.js`),
    format: "esm",
  },
  cjs: {
    file: resolve(`dist/${pkg}.cjs.js`),
    format: "cjs",
  },
  umd: {
    file: resolve(`dist/${pkg}.js`),
    format: "umd",
  },
};

const createConfig = (output) => {
  output.name = buildOptions.name;
  return {
    input: resolve("src/index.ts"),
    output,
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: "ESNext",
          },
        },
        useTsconfigDeclarationDir: true,
      }),
      json(),
      commonjs(),
      nodeResolve(),
    ],
  };
};

const configs = buildOptions.formats.map((format) =>
  createConfig(formatMap[format]),
);

export default configs;
