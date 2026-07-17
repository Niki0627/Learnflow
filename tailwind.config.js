module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#264653",
          light: "#4a6875",
        },
        teal: {
          DEFAULT: "#2a9d8f",
          light: "#58b8ac",
        },
        sand: {
          DEFAULT: "#e9c46a",
          light: "#f1d587",
        },
        clay: {
          DEFAULT: "#f4a261",
          light: "#f9c49a",
        },
        coral: {
          DEFAULT: "#e76f51",
          light: "#f29a86",
        },
        surface: {
          DEFAULT: "#fffdf8",
          warm: "#f7f0e3",
          base: "#f6f1e6",
          divider: "#e8dcc9",
        },
      },
      fontFamily: {
        sans: ["Lexend", "Noto Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(38,70,83,0.08), 0 1px 2px -1px rgba(38,70,83,0.06)",
        "card-hover": "0 8px 24px 0 rgba(42,157,143,0.16)",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #264653 0%, #2a9d8f 100%)",
        "grad-sunset": "linear-gradient(135deg, #f4a261 0%, #e76f51 100%)",
        "grad-aurora": "linear-gradient(135deg, #2a9d8f 0%, #e9c46a 45%, #f4a261 100%)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
