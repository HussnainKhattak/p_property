import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardClient from "@/components/dashboard/UserDashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <UserDashboardClient />
    </div>
  );
}
