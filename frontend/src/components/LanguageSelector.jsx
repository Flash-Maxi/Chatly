import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { serverUrl } from '../main'
import { setUserData } from '../redux/userSlice'
import { useToast } from '../context/ToastContext'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../constants/languages'

/**
 * LanguageSelector
 * @param {boolean} compact — when true, renders a smaller pill (for mobile sidebar)
 */
function LanguageSelector({ compact = false }) {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const { error: showError } = useToast()

    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const containerRef = useRef(null)

    const selectedLanguage = userData?.language || DEFAULT_LANGUAGE

    const persistLanguage = useCallback(async (language, { silent = false } = {}) => {
        if (!userData) return false

        const previousLanguage = userData.language || DEFAULT_LANGUAGE
        dispatch(setUserData({ ...userData, language }))

        try {
            setIsUpdating(true)
            const result = await axios.put(
                `${serverUrl}/api/user/language`,
                { language },
                { withCredentials: true }
            )
            dispatch(setUserData(result.data))
            return true
        } catch (error) {
            dispatch(setUserData({ ...userData, language: previousLanguage }))
            if (!silent) {
                const errorMessage = error?.response?.data?.message || 'Failed to update language. Please try again.'
                showError(errorMessage)
            }
            return false
        } finally {
            setIsUpdating(false)
        }
    }, [userData, dispatch, showError])

    const handleToggle = async () => {
        if (isUpdating) return

        const willOpen = !isOpen
        setIsOpen(willOpen)

        if (willOpen && !userData?.language) {
            await persistLanguage(DEFAULT_LANGUAGE, { silent: true })
        }
    }

    const handleSelect = async (language) => {
        if (language === selectedLanguage || isUpdating) {
            setIsOpen(false)
            return
        }

        setIsOpen(false)
        await persistLanguage(language)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    if (!userData) return null

    // Compact mode: smaller pill, truncate lang to first word or 10 chars
    const langLabel = compact
        ? selectedLanguage.split(' ')[0].slice(0, 10)
        : selectedLanguage

    return (
        <div ref={containerRef} className={`relative ${compact ? 'mb-2' : 'mb-4'}`}>
            <button
                type="button"
                onClick={handleToggle}
                disabled={isUpdating}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Preferred language"
                className={`
                    w-full flex items-center gap-1.5 bg-bgSurface/70 border border-white/10 rounded-xl
                    text-textMain outline-none transition-all duration-300 hover:bg-bgHover
                    focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 cursor-pointer
                    ${compact ? 'px-2 py-1.5' : 'px-3 py-2.5'}
                `}
            >
                <span className={`${compact ? 'text-sm' : 'text-base'}`} aria-hidden="true">🌐</span>
                <span className={`flex-1 text-left font-medium truncate ${compact ? 'text-xs' : 'text-[15px]'}`}>
                    {langLabel}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0"
                    aria-hidden="true"
                >
                    <ChevronDown className={`text-textSub ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        role="listbox"
                        aria-label="Select preferred language"
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-0 right-0 mt-1 max-h-[280px] overflow-y-auto bg-bgSurface/95 backdrop-blur-xl border border-white/10 rounded-xl z-[160] shadow-2xl py-1"
                    >
                        {LANGUAGES.map((lang) => (
                            <li key={lang} role="option" aria-selected={lang === selectedLanguage}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(lang)}
                                    className={`w-full text-left px-4 py-2.5 text-[15px] transition-colors duration-150 cursor-pointer ${
                                        lang === selectedLanguage
                                            ? 'bg-primary/20 text-primary font-semibold'
                                            : 'text-textMain hover:bg-bgHover'
                                    }`}
                                >
                                    {lang}
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}

export default LanguageSelector
