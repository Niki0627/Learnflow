import type { Metadata } from "next";
import "../styles/globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export const metadata: Metadata = {
  title: {
    default: "LearnFlow — AI Study Workspace",
    template: "%s · LearnFlow",
  },
  description: "AI-powered study workspace built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
