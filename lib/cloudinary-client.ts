/**
 * Uploads a file directly from the client browser to Cloudinary.
 * Fetches a secure server-side signature first to avoid exposing api_secret.
 */
export async function uploadDirectToCloudinary(
  file: File,
  folder: string = "peshawar_property_hub/uploads"
): Promise<string> {
  // 1. Get the signature from our API route
  const signatureResponse = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  const sigData = await signatureResponse.json();

  if (!signatureResponse.ok) {
    throw new Error(sigData.error || "Failed to generate upload signature.");
  }

  const { signature, timestamp, apiKey, cloudName } = sigData;

  if (!apiKey || !cloudName) {
    throw new Error("Cloudinary configuration keys are missing in env.");
  }

  // 2. Build the FormData for Cloudinary direct upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  // Determine resource type: image or video
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // 3. Post directly to Cloudinary
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Return a clean error message instead of raw API errors
    throw new Error(responseData.error?.message || "Direct Cloudinary upload failed.");
  }

  return responseData.secure_url;
}
