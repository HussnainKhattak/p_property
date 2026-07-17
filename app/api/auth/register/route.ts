import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(
      { message: "Account created successfully.", user },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration server error details:", err);
    
    let errorMessage = "Something went wrong. Please try again.";
    
    // Detect database connection errors (Prisma codes P1001, P2024, etc., or direct mongo messages)
    if (
      err.code === "P1001" || 
      err.code === "P1012" ||
      err.message?.includes("Can't reach database server") ||
      err.message?.includes("connection") ||
      err.message?.includes("database")
    ) {
      errorMessage = "Service temporarily unavailable. Please try again in a moment.";
    } else if (err.message) {
      errorMessage = err.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
