import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  { ignores: ["types/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
];

export default eslintConfig;
