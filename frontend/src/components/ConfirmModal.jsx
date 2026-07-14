// src/components/ConfirmModal.jsx
// Generic, reusable confirmation modal.
// Props:
//   isOpen        {boolean}   – whether the modal is visible
//   onConfirm     {function}  – called when the user clicks "Yes"
//   onCancel      {function}  – called when the user clicks "No", ESC, or overlay
//   title         {string}    – modal heading
//   message       {string}    – body text (plain string or JSX)
//   confirmLabel  {string}    – confirm button label (default "Yes")
//   cancelLabel   {string}    – cancel button label  (default "No")
//   isLoading     {boolean}   – disables buttons and shows a spinner on confirm
import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  isLoading = false,
}) {
  // ── Focus management ──────────────────────────────────────────────
  // Move focus to the "No" (cancel) button the moment the modal mounts.
  // This is the safest default — a user who presses Enter without reading
  // the modal will NOT accidentally confirm a destructive action.
  const cancelBtnRef = useRef(null)

  useEffect(() => {
    if (isOpen && cancelBtnRef.current) {
      const frame = requestAnimationFrame(() => cancelBtnRef.current?.focus())
      return () => cancelAnimationFrame(frame)
    }
  }, [isOpen])

  // ── Body scroll lock ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── ESC key ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        // ── Overlay ──────────────────────────────────────────────────
        <motion.div
          key="confirm-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => { if (!isLoading) onCancel() }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="confirm-modal-title"
        >
          {/* ── Panel ─────────────────────────────────────────────── */}
          <motion.div
            key="confirm-modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.95,    y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-bgSurface border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
          >
            {/* Title */}
            <h2
              id="confirm-modal-title"
              className="text-base md:text-lg font-semibold text-textMain"
            >
              {title}
            </h2>

            {/* Message */}
            {message && (
              <p className="text-sm text-textSub leading-relaxed">
                {message}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              {/* Cancel — No */}
              <button
                ref={cancelBtnRef}
                onClick={() => { if (!isLoading) onCancel() }}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/15 text-textSub hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>

              {/* Confirm — Yes (destructive red) */}
              <button
                onClick={() => { if (!isLoading) onConfirm() }}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {/* Spinner during in-flight API call */}
                {isLoading && (
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal
