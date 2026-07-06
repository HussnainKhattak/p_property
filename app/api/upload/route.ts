import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // Secure the endpoint - only authenticated users can upload media
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check size limit (e.g., 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert file to Base64 URI format required by Cloudinary SDK uploader
    const mimeType = file.type;
    const base64Data = buffer.toString("base64");
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    const result = await uploadToCloudinary(fileUri, "peshawar_property_hub/uploads");

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Cloudinary upload route error:", err);
    return NextResponse.json(
      { error: "Upload failed: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
