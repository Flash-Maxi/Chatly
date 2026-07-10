import React, { useState } from 'react'
import Cropper from 'react-easy-crop'
import { motion } from 'framer-motion'
import { getCroppedImg } from '../utils/cropImage'
import { IoCloseOutline } from 'react-icons/io5'

/**
 * Reusable modal for cropping an image.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal
 * @param {Function} props.onClose - Triggered when modal is cancelled or closed
 * @param {string} props.imageSrc - The URL of the image to be cropped (e.g. object URL)
 * @param {Function} props.onSave - Callback when the cropped image blob is generated
 * @param {boolean} props.isUploading - If true, displays a loading spinner and disables controls
 */
function CropImageModal({ isOpen, onClose, imageSrc, onSave, isUploading }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = (croppedAreaPercent, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPercent)
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedBlob) {
        onSave(croppedBlob)
      }
    } catch (e) {
      console.error('Cropping error:', e)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isUploading ? null : onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-bgSurface shadow-2xl p-5 sm:p-6 flex flex-col gap-5 text-textMain"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Crop Profile Photo</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close modal"
            className="rounded-lg p-1 text-textSub hover:text-textMain hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-[260px] sm:h-[300px] bg-black/60 rounded-xl overflow-hidden border border-white/5">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={3}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Live Preview and Slider controls */}
        <div className="flex items-center gap-4 bg-bgMain/40 p-3 sm:p-4 rounded-xl border border-white/5">
          {/* Live Preview */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-textSub">Preview</span>
            <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full overflow-hidden border border-white/10 bg-bgMain relative">
              {imageSrc && croppedArea && (
                <img
                  src={imageSrc}
                  alt="Live circular preview"
                  className="absolute max-w-none origin-top-left"
                  style={{
                    width: `${(100 / croppedArea.width) * 100}%`,
                    height: `${(100 / croppedArea.height) * 100}%`,
                    left: `${-(croppedArea.x * (100 / croppedArea.width))}%`,
                    top: `${-(croppedArea.y * (100 / croppedArea.height))}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Slider and Reset */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-textSub font-medium">
              <span>Zoom: {zoom.toFixed(1)}x</span>
              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="text-xs text-primary hover:text-primary/80 disabled:opacity-50 transition-colors font-semibold uppercase tracking-wider"
              >
                Reset
              </button>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1 bg-bgMain rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none disabled:opacity-50"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 border border-white/10 text-sm text-textSub hover:text-textMain hover:bg-white/5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || !imageSrc}
            className="px-5 py-2 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-sm text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default CropImageModal
