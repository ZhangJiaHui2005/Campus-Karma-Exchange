import { v2 as cloudinary } from "cloudinary";

const getCloudinaryConfig = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  if (Object.values(config).some((value) => !value)) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  return config;
};

export const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.config(getCloudinaryConfig());
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
