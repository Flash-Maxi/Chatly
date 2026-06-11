import React, { useEffect, useRef } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
import getImageUrl from '../utils/getImageUrl'
function ReceiverMessage({image,message,onImageClick}) {
  let scroll=useRef()
  let {selectedUser}=useSelector(state=>state.user)
  useEffect(()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  },[message,image])
  
  const handleImageScroll=()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  }
  return (
    <div className="flex items-start gap-2 max-w-[70%]" >
      <img 
        src={getImageUrl(selectedUser?.image)} 
        className="w-8 h-8 rounded-full" 
      />

      <div 
        ref={scroll} 
        className="bg-bgSurface p-3 rounded-lg flex flex-col gap-1"
      >
        {(image && image.trim() && message && message.trim()) ? (
          <div className="space-y-2">
            <img 
              src={getImageUrl(image)} 
              alt="" 
              className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90" 
              onLoad={handleImageScroll} 
              onClick={()=>onImageClick && onImageClick(getImageUrl(image))}
            />
            <p className="text-textMain">{message}</p>
          </div>
        ) : (
          <>
            {image && image.trim() && (
              <img 
                src={getImageUrl(image)} 
                alt="" 
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90" 
                onLoad={handleImageScroll} 
                onClick={()=>onImageClick && onImageClick(getImageUrl(image))}
              />
            )}
            {message && <p className="text-textMain">{message}</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default ReceiverMessage
