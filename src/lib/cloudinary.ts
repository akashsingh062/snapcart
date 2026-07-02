import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

const uploadOnCloudnary = async (file: Blob): Promise<string | null> => {
  try {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "snapcart",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.log(error);
            resolve(null);
          } else {
            resolve(result?.secure_url || null);
          }
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export default uploadOnCloudnary;