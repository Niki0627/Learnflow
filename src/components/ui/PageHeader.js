import React from "react";
import { Box, Typography, Chip } from "@/src/components/tailwind/mui";

export default function PageHeader({ title, subtitle, badge, actions, sx }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 3,
        ...sx,
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
          {badge ? (
            <Chip
              size="small"
              label={badge}
              color="primary"
              sx={{ fontWeight: 800, borderRadius: 999 }}
            />
          ) : null}
        </Box>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{actions}</Box>
      ) : null}
    </Box>
  );
}
