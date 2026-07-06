import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Verify credentials first
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Trigger NextAuth credentials sign-in (updates cookies)
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (err: any) {
      // NextAuth signIn always throws a redirect or error in Route Handlers
      // We check if it is a redirect to proceed successfully
      if (!err.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Authentication failed: " + error.message }, { status: 500 });
  }
}
