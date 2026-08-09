import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  return NextResponse.json({
    success: true,
    message: "Admin logged out successfully",
  });
}

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  return NextResponse.json({
    success: true,
    message: "Admin logged out successfully",
  });
}
