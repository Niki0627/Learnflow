const frontendConfig = require("./frontend/tailwind.config");

module.exports = {
  ...frontendConfig,
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./frontend/src/**/*.{js,jsx,ts,tsx}",
  ],
};
