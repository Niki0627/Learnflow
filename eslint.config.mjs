import nextVitals from "eslint-config-next/core-web-vitals";

const legacyWarnings = {
  ignores: [
    ".next/**",
    "node_modules/**",
    ".venv/**",
    "venv/**",
    "frontend/build/**",
    "frontend/node_modules/**",
    "backend/**",
    "core/**",
    "dark_mode/**",
    "stitch_html/**",
  ],
};

const config = [
  legacyWarnings,
  ...nextVitals,
  {
    rules: {
      "react/display-name": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
