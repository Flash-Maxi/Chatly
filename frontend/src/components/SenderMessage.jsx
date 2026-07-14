import React, { useEffect, useRef } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
import getImageUrl from '../utils/getImageUrl'
import { motion } from 'framer-motion'
import HighlightedText from './HighlightedText'

function SenderMessage({ image, message, onImageClick, searchQuery, matchRanges, activeGlobalIndex }) {
  const scroll = useRef()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    scroll?.current?.scrollIntoView({ behavior: "smooth" })
  }, [message, image])

  const handleImageScroll = () => {
    scroll?.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Render text with highlights when a search is active, plain otherwise
  const renderText = (textClassName) =>
    searchQuery && matchRanges
      ? (
        <HighlightedText
          text={message}
          query={searchQuery}
          matchRanges={matchRanges}
          activeGlobalIndex={activeGlobalIndex}
          className={textClassName}
        />
      )
      : <span className={textClassName}>{message}</span>

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end gap-1.5 md:gap-2 max-w-[75%] md:max-w-[70%] ml-auto flex-row-reverse"
    >
      {/* Sender avatar */}
      <img
        src={getImageUrl(userData?.image)}
        alt=""
        className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
        onError={(e) => { e.target.onerror = null; e.target.src = dp }}
      />

      {/* Bubble */}
      <div
        ref={scroll}
        className="bg-gradient-to-br from-primary to-primary/80 p-2.5 md:p-3 rounded-2xl rounded-tr-sm flex flex-col gap-1 shadow-md shadow-primary/20"
      >
        {(image && image.trim() && message && message.trim()) ? (
          <div className="space-y-1.5">
            <img
              src={getImageUrl(image)}
              alt=""
              className="max-w-[160px] max-h-[160px] md:max-w-[200px] md:max-h-[200px] rounded-lg object-cover cursor-pointer transition-transform duration-200 hover:opacity-90 hover:scale-[1.02]"
              onLoad={handleImageScroll}
              onClick={() => onImageClick && onImageClick(getImageUrl(image))}
            />
            {renderText("text-white text-sm md:text-[15px] leading-relaxed break-words")}
          </div>
        ) : (
          <>
            {image && image.trim() && (
              <img
                src={getImageUrl(image)}
                alt=""
                className="max-w-[160px] max-h-[160px] md:max-w-[200px] md:max-h-[200px] rounded-lg object-cover cursor-pointer transition-transform duration-200 hover:opacity-90 hover:scale-[1.02]"
                onLoad={handleImageScroll}
                onClick={() => onImageClick && onImageClick(getImageUrl(image))}
              />
            )}
            {message && renderText("text-white text-sm md:text-[15px] leading-relaxed break-words")}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default SenderMessage