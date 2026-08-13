"use client";

import "@i18n";
import { AuthProvider, type AuthUser } from "@context/AuthContext";
import SidebarLayout from "./SidebarLayout";

export default function AppShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <SidebarLayout>{children}</SidebarLayout>
    </AuthProvider>
  );
}
