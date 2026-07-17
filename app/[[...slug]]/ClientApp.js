"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../frontend/src/App"), {
  ssr: false,
});

export default function ClientApp() {
  return <App />;
}
