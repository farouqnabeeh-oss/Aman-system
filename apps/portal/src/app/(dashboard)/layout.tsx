import { AppLayout } from "@/components/layout/AppLayout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token');

  if (!refreshToken) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
