import { v2 as cloudinary } from "cloudinary"
import path from "path"

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}

const hasCloudinaryConfig = Boolean(
  cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret,
)

if (hasCloudinaryConfig) {
  cloudinary.config(cloudinaryConfig)
}

export const isCloudinaryConfigured = () => hasCloudinaryConfig

export const uploadToCloudinary = async (filePath, originalName) => {
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "unishare/resources",
    use_filename: true,
    unique_filename: true,
    filename_override: originalName,
  })

  return {
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url,
    bytes: uploadResult.bytes,
    mimeType: uploadResult.resource_type,
  }
}

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    return false
  }

  try {
    const rawDeleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" })
    if (rawDeleteResult.result === "ok" || rawDeleteResult.result === "not found") {
      return true
    }

    const imageDeleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    return imageDeleteResult.result === "ok" || imageDeleteResult.result === "not found"
  } catch (error) {
    console.error(`Error deleting Cloudinary file ${publicId}:`, error)
    return false
  }
}

export const getCloudinarySignedUrl = (publicId, originalFilename, { asAttachment = false, ttlSeconds = 3600 } = {}) => {
  if (!publicId || !hasCloudinaryConfig) {
    return null
  }

  const extensionFromPublicId = path.extname(publicId)
  const extensionFromOriginal = originalFilename ? path.extname(originalFilename) : ""

  const format = !extensionFromPublicId && extensionFromOriginal ? extensionFromOriginal.slice(1) : undefined

  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "raw",
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
    ...(asAttachment ? { attachment: true } : {}),
  })
}
