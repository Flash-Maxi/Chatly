export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // to avoid CORS issues
    image.src = url
  })

/**
 * Returns the cropped image as a Blob.
 * @param {string} imageSrc - The source of the image (object URL or base64)
 * @param {Object} pixelCrop - The cropped area in pixels (from react-easy-crop)
 * @returns {Promise<Blob>} - Cropped image blob
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Set canvas size to the cropped area dimensions to ensure high quality
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw the cropped portion of the image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Output as a Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/jpeg', 0.95)
  })
}
