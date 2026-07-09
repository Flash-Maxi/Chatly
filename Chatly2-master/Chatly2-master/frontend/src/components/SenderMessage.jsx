import React, { useEffect, useRef } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
import getImageUrl from '../utils/getImageUrl'
import { motion } from 'framer-motion'
function SenderMessage({image,message,onImageClick}) {
  let scroll = useRef()
  let {userData}=useSelector(state=>state.user)
  useEffect(()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  },[message,image])
  const handleImageScroll=()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ml-auto flex-row-reverse"
    >
      <img
        src={getImageUrl(userData?.image)}
        alt=""
        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
      />

      <div
        ref={scroll}
        className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-2xl rounded-tr-sm flex flex-col gap-1 shadow-md shadow-primary/20"
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
            <p className="text-white text-[15px] leading-relaxed break-words">{message}</p>
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
            {message && <p className="text-white text-[15px] leading-relaxed break-words">{message}</p>}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default SenderMessage