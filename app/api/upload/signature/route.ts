import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "peshawar_property_hub/uploads";

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
    };

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret || apiSecret === "your-cloudinary-api-secret-here") {
      return NextResponse.json(
        { error: "Cloudinary API Secret is not configured or contains placeholder value." },
        { status: 500 }
      );
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error: any) {
    console.error("Signature generation error:", error);
    return NextResponse.json({ error: "Failed to generate upload signature" }, { status: 500 });
  }
}
