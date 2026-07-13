import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { motion } from 'framer-motion'
import { Mail, Key, ShieldCheck } from 'lucide-react'
import { useToast } from '../context/ToastContext'

function VerifyOtp() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { error: showError, success: showSuccess } = useToast()
    const params = new URLSearchParams(location.search)
    const prefillEmail = params.get('email') || ''

    const [email, setEmail] = useState(prefillEmail)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [emailError, setEmailError] = useState('')
    const [otpError, setOtpError] = useState('')

    // Persist cooldown per-email across reloads using localStorage
    const cooldownKey = (em) => `otpResendUntil:${em}`

    useEffect(() => {
        // on mount or when email changes, restore cooldown from localStorage
        if (!email) return
        try {
            const raw = localStorage.getItem(cooldownKey(email))
            if (!raw) return
            const until = parseInt(raw, 10)
            const now = Date.now()
            if (isNaN(until) || until <= now) {
                localStorage.removeItem(cooldownKey(email))
                return
            }
            const secondsLeft = Math.ceil((until - now) / 1000)
            setCooldown(secondsLeft)
        } catch (err) {
            // ignore storage errors
            console.warn('cooldown restore error', err)
        }
    }, [email])

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(t)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [cooldown])

    useEffect(() => {
        if (prefillEmail) setEmail(prefillEmail)
    }, [prefillEmail])

    const validateInputs = () => {
        let isValid = true
        setEmailError("")
        setOtpError("")

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email.trim()) {
            setEmailError("Email is required")
            isValid = false
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email")
            isValid = false
        }

        if (!otp.trim()) {
            setOtpError("OTP is required")
            isValid = false
        } else if (otp.length !== 6) {
            setOtpError("OTP must be 6 digits")
            isValid = false
        }

        return isValid
    }

    const handleVerify = async (e) => {
        e.preventDefault()

        if (!validateInputs()) {
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
            // Backend sets cookie and returns user
            dispatch(setUserData(res.data.user))
            showSuccess("Account verified successfully! Welcome to Chatily!")
            navigate('/')
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Verification failed'
            showError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email.trim()) {
            showError("Enter your email first")
            return
        } else if (!emailRegex.test(email)) {
            showError("Please enter a valid email")
            return
        }

        setResendLoading(true)
        try {
            const res = await axios.post(`${serverUrl}/api/auth/resend-otp`, { email })
            showSuccess(res.data.message || 'OTP resent successfully')
            // start cooldown (matches server minimum interval of 60s)
            const until = Date.now() + 60 * 1000
            try {
                localStorage.setItem(cooldownKey(email), String(until))
            } catch (err) {
                console.warn('could not persist cooldown', err)
            }
            setCooldown(60)
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to resend OTP'
            showError(errorMessage)
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-500">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-8 py-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Verify Your Account
                        </h1>
                        <p className="text-blue-100 text-lg">Enter the OTP sent to your email</p>
                    </div>

                    <form className="p-8 flex flex-col gap-5" onSubmit={handleVerify}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (emailError) setEmailError("")
                                }}
                                className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl outline-none transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${emailError
                                        ? 'border-red-400 dark:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30'
                                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30'
                                    }`}
                                aria-label="Email address"
                                aria-invalid={!!emailError}
                            />
                            {emailError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-2"
                                >
                                    {emailError}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => {
                                    // Only allow numbers and limit to 6 digits
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                    setOtp(value)
                                    if (otpError) setOtpError("")
                                }}
                                maxLength={6}
                                className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl outline-none transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 tracking-widest text-center text-2xl ${otpError
                                        ? 'border-red-400 dark:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30'
                                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30'
                                    }`}
                                aria-label="OTP code"
                                aria-invalid={!!otpError}
                            />
                            {otpError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-2"
                                >
                                    {otpError}
                                </motion.p>
                            )}
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </motion.button>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                whileHover={!(resendLoading || cooldown > 0) ? { scale: 1.02 } : {}}
                                whileTap={!(resendLoading || cooldown > 0) ? { scale: 0.98 } : {}}
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading || cooldown > 0}
                                className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {resendLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resending...
                                    </>
                                ) : cooldown > 0 ? (
                                    `Resend in ${cooldown}s`
                                ) : (
                                    "Resend OTP"
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default VerifyOtp