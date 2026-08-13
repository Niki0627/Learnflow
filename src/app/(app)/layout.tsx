import { redirect } from "next/navigation";
import { getUser } from "@utils/supabase/server";
import AppShell from "@/src/components/layout/AppShell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <AppShell
      initialUser={{
        id: user.id,
        email: user.email ?? undefined,
        username: user.email ?? "",
        first_name: "",
        last_name: "",
        profile: null,
      }}
    >
      {children}
    </AppShell>
  );
}
