const LANGUAGE_CODES = {
  English: "en",
  Hindi: "hi",
  Spanish: "es",
  French: "fr",
  German: "de",
  Japanese: "ja",
  Korean: "ko",
  "Chinese (Simplified)": "zh-CN",
  Arabic: "ar",
  Portuguese: "pt",
  Russian: "ru",
  Italian: "it",
};

export const getLanguageCode = (language) => LANGUAGE_CODES[language];

export const requestTranslation = async ({ text, sourceLanguage, targetLanguage }) => {
  const sourceCode = getLanguageCode(sourceLanguage);
  const targetCode = getLanguageCode(targetLanguage);
  if (!sourceCode || !targetCode) {
    const error = new Error("Unsupported translation language");
    error.statusCode = 400;
    throw error;
  }

  if (sourceCode === targetCode) return text;

  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    const error = new Error("Translation service is unavailable");
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const translatedText = data?.responseData?.translatedText;
  if (!translatedText || data?.responseStatus !== 200) {
    const error = new Error("Translation service could not translate this message");
    error.statusCode = 502;
    throw error;
  }

  return translatedText;
};
