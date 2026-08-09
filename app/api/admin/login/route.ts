import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Admin credentials are not configured on server" },
        { status: 500 }
      );
    }

    if (
      !email ||
      !password ||
      email.toLowerCase().trim() !== adminEmail.toLowerCase().trim() ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        { error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    // Ensure the admin user exists in DB with Role.ADMIN
    let adminUser = await db.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = await db.user.create({
        data: {
          name: "Admin Peshawar Property Hub",
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
    } else if (adminUser.role !== Role.ADMIN) {
      adminUser = await db.user.update({
        where: { id: adminUser.id },
        data: { role: Role.ADMIN },
      });
    }

    // Set secure HTTP-only cookie for admin_session
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Admin login failed: " + error.message },
      { status: 500 }
    );
  }
}
