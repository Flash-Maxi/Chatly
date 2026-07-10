import axios from 'axios'
import { serverUrl } from '../main'

export const translateMessage = async ({ text, sourceLanguage, targetLanguage }) => {
  const response = await axios.post(
    `${serverUrl}/api/message/translate`,
    { text, sourceLanguage, targetLanguage },
    { withCredentials: true },
  )

  return response.data.translatedText
}
