import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import getImageUrl from '../utils/getImageUrl'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Languages } from 'lucide-react'
import { setMessageTranslation } from '../redux/messageSlice'
import { translateMessage } from '../services/translationService'
import { useToast } from '../context/ToastContext'

function ReceiverMessage({ image, message, senderLanguage, messageId, translatedText, isTranslated, onImageClick }) {
  let scroll=useRef()
  const { selectedUser, userData } = useSelector(state=>state.user)
  const dispatch = useDispatch()
  const { error: showError } = useToast()
  const [isTranslating, setIsTranslating] = useState(false)
  useEffect(()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  },[message,image])
  
  const handleImageScroll=()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  }

  const canTranslate = Boolean(message && senderLanguage && userData?.language && senderLanguage !== userData.language)

  const handleTranslate = async () => {
    if (isTranslating || isTranslated) return

    setIsTranslating(true)
    try {
      const result = await translateMessage({
        text: message,
        sourceLanguage: senderLanguage,
        targetLanguage: userData.language,
      })
      dispatch(setMessageTranslation({ messageId, translatedText: result }))
    } catch (error) {
      showError(error?.response?.data?.message || 'Unable to translate this message.')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]"
    >
      <img
        src={getImageUrl(selectedUser?.image)}
        alt=""
        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shrink-0"
      />

      <div
        ref={scroll}
        className="bg-bgSurface/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl rounded-tl-sm flex flex-col gap-1 shadow-sm"
      >
        {(image && image.trim() && message && message.trim()) ? (
          <div className="space-y-2">
            <img 
              src={getImageUrl(image)} 
              alt="" 
              className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer transition-transform duration-200 hover:opacity-90 hover:scale-[1.02]" 
              onLoad={handleImageScroll} 
              onClick={()=>onImageClick && onImageClick(getImageUrl(image))}
            />
            <p className="text-textMain text-[15px] leading-relaxed break-words">{message}</p>
          </div>
        ) : (
          <>
            {image && image.trim() && (
              <img 
                src={getImageUrl(image)} 
                alt="" 
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer transition-transform duration-200 hover:opacity-90 hover:scale-[1.02]" 
                onLoad={handleImageScroll} 
                onClick={()=>onImageClick && onImageClick(getImageUrl(image))}
              />
            )}
            {message && <p className="text-textMain text-[15px] leading-relaxed break-words">{message}</p>}
          </>
        )}
        {canTranslate && !isTranslated && (
          <div className="mt-1 self-start">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-60 transition-colors"
            >
              {isTranslating ? <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
        )}
        <AnimatePresence>
          {isTranslated && translatedText && (
            <Motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 border-l-2 border-primary/60 bg-primary/5 pl-3 py-1"
            >
              <p className="text-[11px] uppercase tracking-wide text-textSub">Translation</p>
              <p className="mt-0.5 text-sm text-textSub leading-relaxed break-words">{translatedText}</p>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </Motion.div>
  )
}

export default ReceiverMessage
