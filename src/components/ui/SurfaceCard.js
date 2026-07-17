import React from "react";
import { Card, CardContent } from "@/src/components/tailwind/mui";

export default function SurfaceCard({ children, sx, contentSx, ...props }) {
  return (
    <Card
      sx={{
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "rgba(91,79,233,0.16)",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(246,244,255,0.72) 100%)",
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        boxShadow: "0 18px 54px rgba(50,36,184,0.11)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        "&:hover": {
          borderColor: "rgba(91,79,233,0.26)",
          boxShadow: "0 22px 64px rgba(50,36,184,0.14)",
        },
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3, ...contentSx }}>{children}</CardContent>
    </Card>
  );
}
