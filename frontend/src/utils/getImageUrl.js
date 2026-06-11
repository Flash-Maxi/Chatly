import { serverUrl } from '../main'
import dp from '../assets/dp.webp'

const getImageUrl = (imagePath) => {
  if (!imagePath) return dp

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // ensure local uploads start with a leading slash
  if (!imagePath.startsWith('/')) {
    return `${serverUrl}/${imagePath}`
  }

  return `${serverUrl}${imagePath}`
}

export default getImageUrl
