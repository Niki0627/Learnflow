import React from "react";
import { Box, Typography } from "@/src/components/tailwind/mui";
import SurfaceCard from "./SurfaceCard";

export default function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  sx,
}) {
  return (
    <SurfaceCard
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(238,234,254,0.74) 100%)",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.8, fontWeight: 800 }}>
            {value}
          </Typography>
          {hint ? (
            <Typography
              variant="caption"
              sx={{ color: `${tone}.main`, fontWeight: 700 }}
            >
              {hint}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color: `${tone}.main`,
              backgroundColor: "rgba(91,79,233,0.11)",
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Box>
    </SurfaceCard>
  );
}
