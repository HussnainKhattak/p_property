import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  try {
    try {
      await signOut({ redirect: false });
    } catch (err: any) {
      if (!err.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Logout failed: " + error.message }, { status: 500 });
  }
}
