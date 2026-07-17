import React from "react";
import { cn } from "../../lib/utils";

const palette = {
  mode: "light",
  primary: { main: "#5B4FE9", light: "#8F8CFF", dark: "#3124B8", contrastText: "#fff" },
  secondary: { main: "#FF7AB6", light: "#FFA6CF", dark: "#D94F92", contrastText: "#fff" },
  success: { main: "#18B981", light: "#67E8B9", dark: "#0F8F62", contrastText: "#fff" },
  error: { main: "#EF476F", light: "#FF8FAA", dark: "#C92B52" },
  warning: { main: "#F6B84B", light: "#FFD88C", dark: "#C98320" },
  info: { main: "#70D6FF", light: "#A8E8FF", dark: "#2D9FD0" },
  background: { default: "#F7F5FF", paper: "#FFFFFF" },
  text: { primary: "#16112F", secondary: "#625C85", disabled: "#A9A3C7" },
  divider: "#DDD8FA",
};

export const theme = {
  palette,
  spacing: (n) => `${Number(n) * 8}px`,
  shape: { borderRadius: 16 },
  shadows: Array.from({ length: 25 }, (_, i) =>
    i === 0 ? "none" : `0 ${i + 6}px ${i * 3 + 18}px rgba(50,36,184,0.12)`,
  ),
  breakpoints: {
    up: () => "@media (min-width: 900px)",
    down: () => "@media (max-width: 899px)",
  },
};

export function alpha(color, opacity = 1) {
  if (!color) return `rgba(91,79,233,${opacity})`;
  if (color.startsWith("rgba")) return color.replace(/rgba\(([^)]+),[^)]+\)/, `rgba($1,${opacity})`);
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${opacity})`);
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export const createTheme = (tokens = {}) => ({ ...theme, ...tokens, palette: { ...palette, ...tokens.palette } });
export const ThemeProvider = ({ children }) => <>{children}</>;
export const useTheme = () => theme;
export const useMediaQuery = () => false;
export const styled = (Tag) => () => Tag;

const responsiveValue = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if ("xs" in value) return value.xs;
    if ("sm" in value) return value.sm;
    if ("md" in value) return value.md;
    return Object.values(value)[0];
  }
  return value;
};

const resolveToken = (value) => {
  if (typeof value !== "string") return value;
  const colorMatch = value.match(/^(primary|secondary|success|error|warning|info|text|background)\.(main|light|dark|primary|secondary|disabled|paper|default|contrastText)$/);
  if (colorMatch) return palette[colorMatch[1]]?.[colorMatch[2]] || value;
  if (value === "divider") return palette.divider;
  return value;
};

const sxToStyle = (sx) => {
  const source = typeof sx === "function" ? sx(theme) : sx;
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};
  const out = {};
  for (const [key, raw] of Object.entries(source)) {
    if (!raw || key.startsWith("&") || key.startsWith("@") || key.includes(" ")) continue;
    const value = resolveToken(responsiveValue(raw));
    if (value == null || typeof value === "object") continue;
    if (key === "bgcolor") out.backgroundColor = resolveToken(value);
    else if (key === "borderColor") out.borderColor = resolveToken(value);
    else if (key === "m") out.margin = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "mt") out.marginTop = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "mr") out.marginRight = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "mb") out.marginBottom = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "ml") out.marginLeft = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "mx") {
      out.marginLeft = typeof value === "number" ? `${value * 8}px` : value;
      out.marginRight = out.marginLeft;
    } else if (key === "my") {
      out.marginTop = typeof value === "number" ? `${value * 8}px` : value;
      out.marginBottom = out.marginTop;
    } else if (key === "p") out.padding = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "pt") out.paddingTop = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "pr") out.paddingRight = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "pb") out.paddingBottom = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "pl") out.paddingLeft = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "px") {
      out.paddingLeft = typeof value === "number" ? `${value * 8}px` : value;
      out.paddingRight = out.paddingLeft;
    } else if (key === "py") {
      out.paddingTop = typeof value === "number" ? `${value * 8}px` : value;
      out.paddingBottom = out.paddingTop;
    } else if (key === "borderRadius") out.borderRadius = typeof value === "number" ? `${value * 8}px` : value;
    else if (key === "displayPrint") continue;
    else out[key] = value;
  }
  return out;
};

const splitProps = ({
  sx,
  className,
  style,
  component,
  fullWidth,
  gutterBottom,
  elevation,
  maxWidth,
  disableGutters,
  PaperProps,
  ModalProps,
  anchorOrigin,
  transformOrigin,
  inputProps,
  InputLabelProps,
  ...props
}) => ({
  className,
  style: { ...sxToStyle(sx), ...style },
  component,
  props,
});

const make = (Tag, base = "") =>
  React.forwardRef((input, ref) => {
    const { className, style, component, props } = splitProps(input);
    const Comp = component || Tag;
    return <Comp ref={ref} className={cn(base, className)} style={style} {...props} />;
  });

export const Box = make("div");
export const Paper = make("div", "rounded-3xl border border-violet-200/70 bg-white/75 shadow-card backdrop-blur-2xl");
export const Card = make("div", "rounded-3xl border border-violet-200/70 bg-white/75 shadow-card backdrop-blur-2xl");
export const CardContent = make("div", "p-6");
export const Container = React.forwardRef(({ maxWidth = "lg", className, sx, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidth === "sm" ? "max-w-3xl" : maxWidth === "md" ? "max-w-5xl" : "max-w-7xl", className)}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  />
));

export const Stack = React.forwardRef(({ direction = "column", spacing = 0, alignItems, justifyContent, className, sx, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex", responsiveValue(direction) === "row" ? "flex-row" : "flex-col", className)}
    style={{
      gap: typeof spacing === "number" ? `${spacing * 8}px` : spacing,
      alignItems: responsiveValue(alignItems),
      justifyContent: responsiveValue(justifyContent),
      ...sxToStyle(sx),
      ...style,
    }}
    {...props}
  />
));

export const Grid = React.forwardRef(({ container, size, spacing = 0, alignItems, justifyContent, className, sx, style, ...props }, ref) => {
  const gridStyle = { ...sxToStyle(sx), ...style };
  if (container) gridStyle.gap = typeof spacing === "number" ? `${spacing * 8}px` : spacing;
  if (alignItems) gridStyle.alignItems = responsiveValue(alignItems);
  if (justifyContent) gridStyle.justifyContent = responsiveValue(justifyContent);
  const basis = size && typeof size === "object" ? responsiveValue(size) : size;
  if (basis && basis !== "grow") {
    gridStyle.flex = `0 0 ${(Number(basis) / 12) * 100}%`;
    gridStyle.maxWidth = `${(Number(basis) / 12) * 100}%`;
  } else if (basis === "grow") gridStyle.flex = "1 1 0";
  return (
    <div
      ref={ref}
      className={cn(container ? "flex flex-wrap" : "min-w-0", className)}
      style={gridStyle}
      {...props}
    />
  );
});

const variantTags = { h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6", caption: "span", body2: "p", body1: "p" };
const variantClasses = {
  h1: "text-5xl font-black leading-tight",
  h2: "text-4xl font-black leading-tight",
  h3: "text-3xl font-black leading-tight",
  h4: "text-2xl font-extrabold leading-tight",
  h5: "text-xl font-bold",
  h6: "text-lg font-bold",
  body1: "text-base leading-7",
  body2: "text-sm leading-6",
  caption: "text-xs font-semibold",
  overline: "text-xs font-extrabold uppercase",
};
export const Typography = React.forwardRef(({ variant = "body1", color, noWrap, className, sx, style, component, ...props }, ref) => {
  const Comp = component || variantTags[variant] || "p";
  const colorStyle = color ? { color: resolveToken(color) } : {};
  return <Comp ref={ref} className={cn(variantClasses[variant], noWrap && "truncate", className)} style={{ ...colorStyle, ...sxToStyle(sx), ...style }} {...props} />;
});

export const Button = React.forwardRef(({ variant = "text", size = "medium", color, startIcon, endIcon, disabled, fullWidth, className, sx, style, component, ...props }, ref) => {
  const Comp = component || "button";
  const classes = variant === "contained"
    ? "bg-grad-primary text-white shadow-[0_16px_36px_rgba(91,79,233,0.28)] hover:-translate-y-0.5"
    : variant === "outlined"
      ? "border border-violet-300/80 bg-white/70 text-violet-950 backdrop-blur-xl hover:bg-violet-50"
      : "text-violet-950 hover:bg-violet-100/70";
  return (
    <Comp
      ref={ref}
      disabled={disabled}
      className={cn("inline-flex items-center justify-center gap-2 rounded-full font-bold transition disabled:pointer-events-none disabled:opacity-60", fullWidth && "w-full", size === "small" ? "px-3 py-1.5 text-xs" : size === "large" ? "px-7 py-3 text-base" : "px-5 py-2.5 text-sm", classes, className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      {startIcon}
      {props.children}
      {endIcon}
    </Comp>
  );
});

export const IconButton = React.forwardRef(({ size, className, sx, style, ...props }, ref) => (
  <button ref={ref} type="button" className={cn("inline-grid place-items-center rounded-2xl p-2 text-violet-950 transition hover:bg-violet-100/80", size === "small" && "p-1.5", className)} style={{ ...sxToStyle(sx), ...style }} {...props} />
));

export const Chip = React.forwardRef(({ label, icon, className, sx, style, ...props }, ref) => (
  <span ref={ref} className={cn("inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/70 px-3 py-1 text-xs font-extrabold text-violet-900", className)} style={{ ...sxToStyle(sx), ...style }} {...props}>{icon}{label || props.children}</span>
));

export const TextField = React.forwardRef(({ label, helperText, error, select, children, multiline, rows, InputProps, fullWidth, className, sx, style, ...props }, ref) => {
  const common = cn("w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm outline-none backdrop-blur-xl transition focus:border-violet-500", error ? "border-rose-400" : "border-violet-200", className);
  return (
    <label className="block w-full" style={{ ...sxToStyle(sx), ...style }}>
      {label && <span className="mb-1.5 block text-sm font-bold text-violet-950/75">{label}</span>}
      {select ? (
        <select ref={ref} className={common} {...props}>{children}</select>
      ) : multiline ? (
        <textarea ref={ref} rows={rows || 4} className={common} {...props} />
      ) : (
        <div className="relative">
          {InputProps?.startAdornment}
          <input ref={ref} className={common} {...props} />
          {InputProps?.endAdornment}
        </div>
      )}
      {helperText && <span className={cn("mt-1 block text-xs", error ? "text-rose-600" : "text-violet-950/55")}>{helperText}</span>}
    </label>
  );
});

export const MenuItem = React.forwardRef(({ value, className, sx, style, ...props }, ref) => (
  <option ref={ref} value={value} className={className} style={{ ...sxToStyle(sx), ...style }} {...props} />
));

export const Select = React.forwardRef(({ children, className, sx, style, ...props }, ref) => (
  <select ref={ref} className={cn("w-full rounded-2xl border border-violet-200 bg-white/80 px-4 py-3 text-sm", className)} style={{ ...sxToStyle(sx), ...style }} {...props}>{children}</select>
));

export const FormControl = make("div", "space-y-1");
export const InputLabel = make("label", "text-sm font-bold text-violet-950/70");
export const InputAdornment = make("span", "inline-flex items-center");
export const FormGroup = make("div", "space-y-2");
export const FormControlLabel = ({ control, label, ...props }) => <label className="flex items-center gap-2 text-sm font-medium" {...props}>{control}{label}</label>;
export const Checkbox = ({ checked, ...props }) => <input type="checkbox" checked={checked} className="h-4 w-4 accent-violet-600" {...props} />;
export const Switch = ({ checked, ...props }) => <input type="checkbox" role="switch" checked={checked} className="h-5 w-10 accent-violet-600" {...props} />;
export const Slider = ({ value, ...props }) => <input type="range" value={value} className="w-full accent-violet-600" {...props} />;

export const CircularProgress = ({ size = 24, className }) => <span className={cn("inline-block animate-spin rounded-full border-2 border-current border-r-transparent", className)} style={{ width: size, height: size }} />;
export const LinearProgress = ({ value, className, sx, style }) => <div className={cn("h-2 overflow-hidden rounded-full bg-violet-100", className)} style={{ ...sxToStyle(sx), ...style }}><div className="h-full rounded-full bg-grad-primary" style={{ width: `${value ?? 45}%` }} /></div>;
export const Skeleton = ({ height = 80, className, sx, style }) => <div className={cn("animate-pulse rounded-2xl bg-violet-100/80", className)} style={{ height, ...sxToStyle(sx), ...style }} />;

export const Divider = React.forwardRef(({ children, className, sx, style, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("my-2 flex items-center gap-3 text-xs font-semibold text-violet-950/50 before:h-px before:flex-1 before:bg-violet-200/80 after:h-px after:flex-1 after:bg-violet-200/80", !children && "block h-px bg-violet-200/80 before:hidden after:hidden", className)}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </div>
));
export const Avatar = React.forwardRef(({ src, children, className, sx, style, ...props }, ref) => <div ref={ref} className={cn("grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-grad-primary text-sm font-black text-white", className)} style={{ ...sxToStyle(sx), ...style }} {...props}>{src ? <img src={src} alt="" className="h-full w-full object-cover" /> : children}</div>);
export const Badge = ({ badgeContent, children }) => <span className="relative inline-flex">{children}{badgeContent ? <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">{badgeContent}</span> : null}</span>;
export const Tooltip = ({ children }) => <>{children}</>;

export const Alert = React.forwardRef(({ severity = "info", className, sx, style, ...props }, ref) => <div ref={ref} role="alert" className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold", severity === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : severity === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-violet-200 bg-violet-50 text-violet-900", className)} style={{ ...sxToStyle(sx), ...style }} {...props} />);

export const Dialog = ({ open, children }) => open ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#16112f]/45 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-violet-200 bg-white p-0 shadow-[0_36px_90px_rgba(22,17,47,0.28)]">{children}</div></div> : null;
export const DialogTitle = make("div", "px-6 pt-6 text-xl font-black");
export const DialogContent = make("div", "p-6");
export const DialogActions = make("div", "flex justify-end gap-2 px-6 pb-6");
export const Drawer = ({ open, onClose, children }) => open ? <div className="fixed inset-0 z-50 bg-[#16112f]/30" onClick={onClose}><div className="h-full w-72 bg-white/95 shadow-card backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>{children}</div></div> : null;
export const Menu = ({ open, children }) => open ? <div className="fixed right-4 top-16 z-50 min-w-56 rounded-2xl border border-violet-200 bg-white/95 p-2 shadow-card backdrop-blur-2xl">{children}</div> : null;
export const Popover = Menu;
export const Snackbar = ({ open, message, children }) => open ? <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-violet-950 px-4 py-3 text-white shadow-card">{children || message}</div> : null;

export const AppBar = make("header", "sticky top-0 z-40 border-b border-violet-200/70 bg-white/75 backdrop-blur-2xl");
export const Toolbar = make("div", "flex min-h-16 items-center");
export const List = make("ul", "space-y-1");
export const ListItem = make("li");
export const ListItemButton = make("button", "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-violet-100/70");
export const ListItemIcon = make("span", "inline-flex");
export const ListItemText = ({ primary, secondary, ...props }) => <span {...props}><span className="block font-bold">{primary}</span>{secondary && <span className="block text-xs text-violet-950/55">{secondary}</span>}</span>;
export const ListItemAvatar = make("span");
export const Link = make("a", "font-bold text-violet-700");
export const Tabs = make("div", "flex gap-1 rounded-2xl bg-violet-100/60 p-1");
export const Tab = make("button", "rounded-xl px-4 py-2 text-sm font-bold hover:bg-white/80");
export const ToggleButtonGroup = make("div", "inline-flex rounded-2xl border border-violet-200 p-1");
export const ToggleButton = make("button", "rounded-xl px-3 py-2 text-sm font-bold hover:bg-violet-100");
export const Accordion = make("details", "rounded-2xl border border-violet-200 bg-white/75 p-3");
export const AccordionSummary = make("summary", "cursor-pointer font-bold");
export const AccordionDetails = make("div", "pt-3");
export const Collapse = ({ in: show = true, children }) => show ? children : null;
export const Fade = ({ in: show = true, children }) => show ? children : null;

export const TableContainer = make("div", "overflow-auto rounded-2xl border border-violet-200");
export const Table = make("table", "w-full border-collapse text-sm");
export const TableHead = make("thead", "bg-violet-50");
export const TableBody = make("tbody");
export const TableRow = make("tr", "border-b border-violet-100");
export const TableCell = make("td", "px-4 py-3 text-left");
export const CssBaseline = () => null;
