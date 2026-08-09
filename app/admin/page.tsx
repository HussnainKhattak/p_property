import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "true";

  const isAdmin = session?.user?.role === "ADMIN" || hasAdminCookie;

  // Redirect to admin login if not authenticated as admin
  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient />
    </div>
  );
}
