const DEVANAGARI_PATTERN = /[\u0900-\u097F]/
const LATIN_LETTER_PATTERN = /[A-Za-z]/

export const isRomanHindi = (message, preferredLanguage) => (
  preferredLanguage === 'Hindi'
  && typeof message === 'string'
  && LATIN_LETTER_PATTERN.test(message)
  && !DEVANAGARI_PATTERN.test(message)
)
