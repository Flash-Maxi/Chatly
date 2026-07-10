import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { setSelectedUser, setUserData } from '../redux/userSlice'
import { useToast } from '../context/ToastContext'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle,
    XCircle,
    Heart
} from "lucide-react";

function Login() {
    let navigate = useNavigate()
    const { error: showError, success: showSuccess } = useToast()
    let [showPassword, setShowPassword] = useState(false)
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [loading, setLoading] = useState(false)
    let [err, setErr] = useState("")
    let [rememberMe, setRememberMe] = useState(false)
    let [emailTouched, setEmailTouched] = useState(false)
    let [passwordTouched, setPasswordTouched] = useState(false)
    let [isDark, setIsDark] = useState(false)
    let dispatch = useDispatch()

    // Check system preference for dark mode
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDark(mediaQuery.matches)

        const handler = (e) => setIsDark(e.matches)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    // Email validation
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Password validation
    const isValidPassword = (password) => {
        return password.length >= 6
    }

    const getEmailError = () => {
        if (!email && emailTouched) return "Email is required"
        if (email && !isValidEmail(email)) return "Please enter a valid email"
        return null
    }

    const getPasswordError = () => {
        if (!password && passwordTouched) return "Password is required"
        if (password && !isValidPassword(password)) return "Password must be at least 6 characters"
        return null
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setEmailTouched(true)
        setPasswordTouched(true)

        if (!isValidEmail(email) || !isValidPassword(password)) {
            return
        }

        setLoading(true)
        try {
            let result = await axios.post(`${serverUrl}/api/auth/login`, {
                email, password
            }, { withCredentials: true })
            dispatch(setUserData(result.data))
            dispatch(setSelectedUser(null))
            navigate("/")
            setEmail("")
            setPassword("")
            setLoading(false)
            setErr("")
        } catch (error) {
            console.log(error)
            setLoading(false)
            const msg = error?.response?.data?.message || 'Login failed. Please try again.'
            if (msg.toLowerCase().includes('verify')) {
                setErr(msg)
                showError(msg)
                setTimeout(() => {
                    navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
                }, 1200)
                return
            }
            setErr(msg)
            showError(msg)
        }
    }

    const handleSocialLogin = (provider) => {
        // Placeholder for social login functionality
        console.log(`Login with ${provider}`)
    }

    return (
        <div className={`min-h-screen w-full flex items-center justify-center transition-all duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} overflow-hidden`}>
            {/* Animated gradient background */}
            <div className="fixed inset-0 overflow-hidden">
                <motion.div
                    className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-blue-600' : 'bg-blue-400'} opacity-30`}
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-purple-600' : 'bg-purple-400'} opacity-30`}
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.15, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-cyan-600' : 'bg-cyan-400'} opacity-20`}
                    animate={{
                        x: ['-50%', '-45%', '-50%'],
                        y: ['-50%', '-55%', '-50%'],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
            </div>

            {/* Main login card with glassmorphism */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`relative z-10 w-full max-w-md mx-4 p-8 rounded-3xl backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-white/60 border border-white/80'} shadow-2xl`}
            >
                {/* Logo/Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block mb-4"
                    >
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl font-bold">C</span>
                        </div>
                    </motion.div>
                    <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Welcome back to <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Chatly</span>
                    </h1>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to continue to your account</p>
                </motion.div>

                {/* Login Form */}
                <form className="space-y-5" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="space-y-1"
                    >
                        <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Email Address
                        </label>
                        <div className="relative group">
                            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${getEmailError() ? 'text-red-500' : isDark ? 'text-slate-400 group-focus-within:text-blue-400' : 'text-slate-500 group-focus-within:text-blue-500'}`} />
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all duration-300 ${isDark ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' : 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400'} border-2 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 ${getEmailError() ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                                aria-invalid={!!getEmailError()}
                                aria-describedby={getEmailError() ? "email-error" : undefined}
                            />
                            {emailTouched && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    {isValidEmail(email) ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </motion.div>
                            )}
                        </div>
                        {getEmailError() && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                id="email-error"
                                className="text-sm text-red-500 flex items-center gap-1 mt-1"
                            >
                                <XCircle className="w-4 h-4" /> {getEmailError()}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="space-y-1"
                    >
                        <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${getPasswordError() ? 'text-red-500' : isDark ? 'text-slate-400 group-focus-within:text-blue-400' : 'text-slate-500 group-focus-within:text-blue-500'}`} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setPasswordTouched(true)}
                                className={`w-full pl-12 pr-14 py-4 rounded-xl outline-none transition-all duration-300 ${isDark ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' : 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400'} border-2 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 ${getPasswordError() ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                                aria-invalid={!!getPasswordError()}
                                aria-describedby={getPasswordError() ? "password-error" : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {getPasswordError() && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                id="password-error"
                                className="text-sm text-red-500 flex items-center gap-1 mt-1"
                            >
                                <XCircle className="w-4 h-4" /> {getPasswordError()}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Remember Me & Forgot Password */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex items-center justify-between"
                    >
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only"
                                    id="remember-me"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${rememberMe ? 'bg-blue-500 border-blue-500' : isDark ? 'border-slate-600 group-hover:border-slate-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {rememberMe && (
                                        <CheckCircle className="w-full h-full text-white p-0.5" />
                                    )}
                                </div>
                            </div>
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Remember me</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors duration-300 hover:underline"
                        >
                            Forgot password?
                        </button>
                    </motion.div>

                    {/* Error Message */}
                    {err && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
                        >
                            {err}
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Sign Up Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className={`mt-8 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="font-semibold text-blue-500 hover:text-blue-600 transition-colors duration-300 hover:underline"
                    >
                        Sign up
                    </button>
                </motion.p>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'} text-center`}
                >
                    <p className={`text-xs flex items-center justify-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Chatly Team
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Login
