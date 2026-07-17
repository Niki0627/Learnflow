import { createTheme, alpha } from "@/src/components/tailwind/mui";

export const PALETTE = {
  ink: "#16112F",
  muted: "#625C85",
  primary: "#5B4FE9",
  primaryDark: "#3124B8",
  primaryLight: "#8F8CFF",
  violet: "#7467F0",
  lavender: "#EEEAFE",
  sky: "#70D6FF",
  rose: "#FF7AB6",
  success: "#18B981",
  warning: "#F6B84B",
  error: "#EF476F",
  paper: "#FFFFFF",
  canvas: "#F7F5FF",
  line: "#DDD8FA",
};

export const COLORS = {
  ink: PALETTE.ink,
  violet: PALETTE.primary,
  lavender: PALETTE.lavender,
  sky: PALETTE.sky,
  rose: PALETTE.rose,
};

export const GRADIENTS = {
  primary: "linear-gradient(135deg, #5B4FE9 0%, #7467F0 52%, #8F8CFF 100%)",
  deep: "linear-gradient(135deg, #24176D 0%, #4F3DDB 58%, #7668F3 100%)",
  hero: "linear-gradient(140deg, #5B4FE9 0%, #6C63EF 46%, #8F8CFF 100%)",
  glass:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(246,244,255,0.72) 100%)",
  accent: "linear-gradient(135deg, #70D6FF 0%, #8F8CFF 52%, #FF7AB6 100%)",
};

export const SUBJECT_COLORS = [
  "#5B4FE9",
  "#7467F0",
  "#8F8CFF",
  "#70D6FF",
  "#FF7AB6",
  "#18B981",
  "#F6B84B",
  "#EF476F",
  "#3124B8",
  "#625C85",
];

const glassSurface = {
  background: GRADIENTS.glass,
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)",
  border: `1px solid ${alpha(PALETTE.primary, 0.16)}`,
  boxShadow: "0 24px 70px rgba(50, 36, 184, 0.13)",
};

export const getDesignTokens = () => ({
  learnflow: {
    spacingBase: 8,
    radius: { sm: 8, md: 12, lg: 18, xl: 24 },
    contentMax: 1280,
    motionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    motionFast: "160ms",
    motionMedium: "260ms",
  },
  palette: {
    mode: "light",
    primary: {
      main: PALETTE.primary,
      light: PALETTE.primaryLight,
      dark: PALETTE.primaryDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: PALETTE.rose,
      light: "#FFA6CF",
      dark: "#D94F92",
      contrastText: "#FFFFFF",
    },
    success: {
      main: PALETTE.success,
      light: "#67E8B9",
      dark: "#0F8F62",
      contrastText: "#FFFFFF",
    },
    error: {
      main: PALETTE.error,
      light: "#FF8FAA",
      dark: "#C92B52",
    },
    warning: {
      main: PALETTE.warning,
      light: "#FFD88C",
      dark: "#C98320",
    },
    info: {
      main: PALETTE.sky,
      light: "#A8E8FF",
      dark: "#2D9FD0",
      contrastText: PALETTE.ink,
    },
    background: {
      default: PALETTE.canvas,
      paper: PALETTE.paper,
    },
    text: {
      primary: PALETTE.ink,
      secondary: PALETTE.muted,
      disabled: "#A9A3C7",
    },
    divider: PALETTE.line,
    action: {
      hover: alpha(PALETTE.primary, 0.08),
      selected: alpha(PALETTE.primary, 0.14),
      disabledBackground: alpha(PALETTE.primary, 0.08),
    },
  },
  typography: {
    fontFamily:
      '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "3.85rem",
      fontWeight: 900,
      letterSpacing: 0,
      lineHeight: 1.04,
    },
    h2: {
      fontSize: "2.55rem",
      fontWeight: 900,
      letterSpacing: 0,
      lineHeight: 1.12,
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 850,
      letterSpacing: 0,
      lineHeight: 1.18,
    },
    h4: { fontSize: "1.55rem", fontWeight: 820, letterSpacing: 0, lineHeight: 1.24 },
    h5: { fontSize: "1.22rem", fontWeight: 780, letterSpacing: 0 },
    h6: { fontSize: "1.04rem", fontWeight: 760, letterSpacing: 0 },
    body1: { fontSize: "1rem", lineHeight: 1.66, fontWeight: 450, letterSpacing: 0 },
    body2: { fontSize: "0.9rem", lineHeight: 1.58, fontWeight: 440, letterSpacing: 0 },
    button: {
      textTransform: "none",
      fontWeight: 780,
      fontSize: "0.9rem",
      letterSpacing: 0,
    },
    caption: { fontSize: "0.75rem", fontWeight: 650, letterSpacing: 0 },
    overline: { fontSize: "0.72rem", fontWeight: 820, letterSpacing: 0 },
    subtitle1: { fontWeight: 720, letterSpacing: 0 },
    subtitle2: { fontWeight: 700, letterSpacing: 0 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: PALETTE.canvas,
          color: PALETTE.ink,
          backgroundImage:
            "linear-gradient(145deg, rgba(91,79,233,0.10) 0%, rgba(255,255,255,0) 32%), linear-gradient(315deg, rgba(143,140,255,0.13) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, #FFFFFF 0%, #F7F5FF 42%, #F0ECFF 100%)",
          minHeight: "100vh",
        },
        "::selection": {
          background: alpha(PALETTE.primary, 0.18),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: "none",
          padding: "10px 22px",
          fontWeight: 800,
          letterSpacing: 0,
          position: "relative",
          overflow: "hidden",
          transition:
            "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms cubic-bezier(0.22, 1, 0.36, 1), background-color 180ms cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": { transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0)" },
        },
        contained: {
          color: "#FFFFFF",
          background: GRADIENTS.primary,
          boxShadow: "0 16px 36px rgba(91,79,233,0.28)",
          "&:hover": {
            background: GRADIENTS.deep,
            boxShadow: "0 22px 44px rgba(91,79,233,0.34)",
          },
          "&.Mui-disabled": {
            color: "rgba(255,255,255,0.9)",
            background: "#BDB7EE",
            boxShadow: "none",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #FF7AB6 0%, #8F8CFF 100%)",
          boxShadow: "0 16px 34px rgba(255,122,182,0.28)",
        },
        outlined: {
          borderWidth: 1.5,
          color: PALETTE.primaryDark,
          borderColor: alpha(PALETTE.primary, 0.26),
          backgroundColor: "rgba(255,255,255,0.62)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          "&:hover": {
            borderWidth: 1.5,
            borderColor: PALETTE.primary,
            backgroundColor: alpha(PALETTE.primary, 0.08),
            boxShadow: "0 14px 28px rgba(91,79,233,0.16)",
          },
        },
        text: {
          color: PALETTE.ink,
          "&:hover": {
            backgroundColor: alpha(PALETTE.primary, 0.08),
          },
        },
        sizeSmall: { padding: "6px 14px", fontSize: "0.8rem" },
        sizeMedium: { padding: "9px 18px", fontSize: "0.88rem" },
        sizeLarge: { padding: "13px 30px", fontSize: "1rem" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          ...glassSurface,
          overflow: "hidden",
          transition: "box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease",
          "&:hover": {
            borderColor: alpha(PALETTE.primary, 0.26),
            boxShadow: "0 28px 80px rgba(50, 36, 184, 0.17)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 22 },
        elevation0: glassSurface,
        elevation1: { boxShadow: "0 12px 32px rgba(50,36,184,0.10)" },
        elevation2: { boxShadow: "0 18px 44px rgba(50,36,184,0.13)" },
        elevation4: { boxShadow: "0 26px 70px rgba(50,36,184,0.18)" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.74)",
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          color: PALETTE.ink,
          boxShadow: "none",
          borderBottom: `1px solid ${alpha(PALETTE.primary, 0.13)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,238,255,0.82) 100%)",
          color: PALETTE.ink,
          borderRight: `1px solid ${alpha(PALETTE.primary, 0.14)}`,
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          boxShadow: "10px 0 50px rgba(50,36,184,0.13)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 780,
          borderRadius: 999,
          borderColor: alpha(PALETTE.primary, 0.2),
        },
        colorPrimary: {
          backgroundColor: alpha(PALETTE.primary, 0.11),
          color: PALETTE.primaryDark,
        },
        outlined: {
          backgroundColor: "rgba(255,255,255,0.58)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(PALETTE.primary, 0.12),
          borderRadius: 999,
          height: 8,
        },
        bar: {
          borderRadius: 999,
          background: GRADIENTS.primary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: alpha(PALETTE.primary, 0.18),
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            },
            "&:hover fieldset": { borderColor: alpha(PALETTE.primary, 0.45) },
            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
              "& fieldset": { borderColor: PALETTE.primary, borderWidth: 2 },
            },
          },
          "& .MuiInputLabel-root": { fontWeight: 650 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          "& fieldset": { borderColor: alpha(PALETTE.primary, 0.18) },
          "&:hover fieldset": { borderColor: alpha(PALETTE.primary, 0.45) },
          "&.Mui-focused fieldset": { borderColor: PALETTE.primary, borderWidth: 2 },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          ...glassSurface,
          boxShadow: "0 36px 90px rgba(22,17,47,0.28)",
        },
        backdrop: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(22,17,47,0.42)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 10,
          fontWeight: 700,
          fontSize: "0.75rem",
          backgroundColor: PALETTE.ink,
          padding: "7px 12px",
        },
        arrow: { color: PALETTE.ink },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.18s ease",
          "&.Mui-selected": {
            background: alpha(PALETTE.primary, 0.12),
            color: PALETTE.primaryDark,
            "&:hover": { background: alpha(PALETTE.primary, 0.16) },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          ...glassSurface,
          boxShadow: "none",
          "&:before": { display: "none" },
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: alpha(PALETTE.primary, 0.14) } } },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 800 } } },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: `1px solid ${alpha(PALETTE.primary, 0.16)}`,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 20px 56px rgba(22,17,47,0.16)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "3px 8px",
          fontWeight: 620,
          "&:hover": { backgroundColor: alpha(PALETTE.primary, 0.08) },
          "&.Mui-selected": {
            backgroundColor: alpha(PALETTE.primary, 0.12),
            fontWeight: 800,
            "&:hover": { backgroundColor: alpha(PALETTE.primary, 0.16) },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 560,
          border: `1px solid ${alpha(PALETTE.primary, 0.12)}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 850,
          fontSize: "1.125rem",
          letterSpacing: 0,
          padding: "24px 24px 16px",
        },
      },
    },
    MuiDialogContent: { styleOverrides: { root: { padding: "0 24px 16px" } } },
    MuiDialogActions: {
      styleOverrides: { root: { padding: "12px 24px 24px", gap: 8 } },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontWeight: 650, "&.Mui-focused": { color: PALETTE.primary } },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 850, fontSize: "0.65rem" },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 3, borderRadius: 999, background: GRADIENTS.primary },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 650,
          fontSize: "0.875rem",
          textTransform: "none",
          minHeight: 44,
          letterSpacing: 0,
          "&.Mui-selected": { fontWeight: 820, color: PALETTE.primary },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          color: PALETTE.muted,
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: 0,
        },
        root: { borderColor: alpha(PALETTE.primary, 0.12) },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: "all 0.2s ease",
          color: PALETTE.ink,
          "&:hover": {
            transform: "translateY(-1px)",
            backgroundColor: alpha(PALETTE.primary, 0.09),
          },
        },
      },
    },
  },
});

const theme = createTheme(getDesignTokens("light"));
export default theme;
