import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect if user is not an administrator
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient />
    </div>
  );
}
