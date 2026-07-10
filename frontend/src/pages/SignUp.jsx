import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, MessageSquare, Languages, ChevronDown } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../constants/languages'

function SignUp() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [userName, setUserName] = useState("")
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [nameError, setNameError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const dispatch = useDispatch()
    const { error: showError, success: showSuccess } = useToast()

    const validateInputs = () => {
        let isValid = true
        setNameError("")
        setEmailError("")
        setPasswordError("")

        const nameRegex = /^[A-Za-z\s]+$/
        if (!userName.trim()) {
            setNameError("Username is required")
            isValid = false
        } else if (!nameRegex.test(userName)) {
            setNameError("Name should contain alphabets only")
            isValid = false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email.trim()) {
            setEmailError("Email is required")
            isValid = false
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email")
            isValid = false
        }

        if (!password) {
            setPasswordError("Password is required")
            isValid = false
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            isValid = false
        }

        return isValid
    }

    const handleSignUp = async (e) => {
        e.preventDefault()
        
        if (!validateInputs()) {
            return
        }

        setLoading(true)
        try {
            await axios.post(
                `${serverUrl}/api/auth/signup`,
                { userName, email, password, language },
                { withCredentials: true }
            )
            showSuccess("Account created successfully! Please verify your email.")
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
            setEmail("")
            setPassword("")
            setUserName("")
            setLanguage(DEFAULT_LANGUAGE)
        } catch (error) {
            console.log(error)
            const errorMessage = error?.response?.data?.message || 'Signup failed. Please try again.'
            showError(errorMessage)
        } finally {
            setLoading(false)
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
                            <MessageSquare className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Join Chatly
                        </h1>
                        <p className="text-blue-100 text-lg">Create your account today</p>
                    </div>

                    <form className="p-8 flex flex-col gap-5" onSubmit={handleSignUp}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={userName}
                                onChange={(e) => {
                                    setUserName(e.target.value)
                                    if (nameError) setNameError("")
                                }}
                                className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl outline-none transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                                    nameError 
                                        ? 'border-red-400 dark:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30' 
                                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30'
                                }`}
                                aria-label="Username"
                                aria-invalid={!!nameError}
                            />
                            {nameError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-2 flex items-center gap-1"
                                >
                                    <span className="font-medium">{nameError}</span>
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.225 }}
                            className="relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Languages className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl outline-none transition-all duration-300 text-gray-800 dark:text-white border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 appearance-none cursor-pointer"
                                aria-label="Preferred Language"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                                        {lang}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none" aria-hidden="true">
                                <ChevronDown className="h-5 w-5" style={{ color: '#9CA3AF' }} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
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
                                className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl outline-none transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                                    emailError 
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
                                    className="text-red-500 text-sm mt-2 flex items-center gap-1"
                                >
                                    <span className="font-medium">{emailError}</span>
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (passwordError) setPasswordError("")
                                }}
                                className={`w-full pl-12 pr-14 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl outline-none transition-all duration-300 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                                    passwordError 
                                        ? 'border-red-400 dark:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30' 
                                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30'
                                }`}
                                aria-label="Password"
                                aria-invalid={!!passwordError}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                            {passwordError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-2 flex items-center gap-1"
                                >
                                    <span className="font-medium">{passwordError}</span>
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center mt-4"
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none focus:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </motion.div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default SignUp