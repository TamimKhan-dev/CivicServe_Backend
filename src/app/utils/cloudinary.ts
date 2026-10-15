import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = (
	buffer: Buffer,
	folder: string,
): Promise<UploadApiResponse> =>
	new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream({ resource_type: "image", folder }, (error, result) => {
				if (error || !result) {
					return reject(error ?? new Error("Cloudinary upload failed"));
				}
				resolve(result);
			})
			.end(buffer);
	});

export const deleteFromCloudinary = (publicId: string) =>
	cloudinary.uploader.destroy(publicId);
