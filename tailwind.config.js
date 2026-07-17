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
          DEFAULT: "#16112F",
          light: "#625C85",
        },
        violet: {
          DEFAULT: "#5B4FE9",
          light: "#8F8CFF",
          dark: "#3124B8",
        },
        lavender: {
          DEFAULT: "#EEEAFE",
          light: "#F7F5FF",
        },
        sky: {
          DEFAULT: "#70D6FF",
          light: "#A8E8FF",
        },
        rose: {
          DEFAULT: "#FF7AB6",
          light: "#FFA6CF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          warm: "#F7F5FF",
          base: "#F0ECFF",
          divider: "#DDD8FA",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 70px rgba(50,36,184,0.13)",
        "card-hover": "0 30px 90px rgba(50,36,184,0.18)",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #5B4FE9 0%, #7467F0 52%, #8F8CFF 100%)",
        "grad-deep": "linear-gradient(135deg, #24176D 0%, #4F3DDB 58%, #7668F3 100%)",
        "grad-accent": "linear-gradient(135deg, #70D6FF 0%, #8F8CFF 52%, #FF7AB6 100%)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
