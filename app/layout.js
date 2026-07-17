import "../frontend/src/index.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export const metadata = {
  title: "LearnFlow",
  description: "AI-powered study workspace built with Next.js and Supabase.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
