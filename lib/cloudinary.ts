import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

/**
 * Uploads a file (base64 string or buffer URI) to Cloudinary.
 * 
 * @param fileUri - Base64 encoded file or buffer string
 * @param folder - Folder path within Cloudinary
 */
export const uploadToCloudinary = (
  fileUri: string,
  folder: string = "peshawar_property_hub"
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileUri,
      {
        folder,
        resource_type: "auto", // Allows both image and video uploads
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result!.public_id,
          secure_url: result!.secure_url,
          resource_type: result!.resource_type,
        });
      }
    );
  });
};

/**
 * Deletes an asset from Cloudinary using its public ID.
 * 
 * @param publicId - Cloudinary public ID of the asset to delete
 */
export const deleteFromCloudinary = (publicId: string): Promise<{ result: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};
export { cloudinary };
