import axios from 'axios'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, KeyRound, Lock, Mail, RotateCcw } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { serverUrl } from '../main'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ForgotPassword() {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useToast()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const otpInputs = useRef([])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const updateTheme = () => setIsDark(query.matches)
    updateTheme()
    query.addEventListener('change', updateTheme)
    return () => query.removeEventListener('change', updateTheme)
  }, [])

  const submitEmail = async (event) => {
    event.preventDefault()
    if (!emailPattern.test(email.trim())) return showError('Please enter a valid email.')

    setLoading(true)
    try {
      const response = await axios.post(`${serverUrl}/api/auth/forgot-password`, { email: email.trim() })
      setEmail(email.trim())
      showSuccess(response.data.message || 'OTP has been sent to your email.')
      setStep(2)
    } catch (error) {
      showError(error?.response?.data?.message || 'Unable to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateOtp = (value, index) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpInputs.current[index + 1]?.focus()
  }

  const pasteOtp = (event) => {
    event.preventDefault()
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (!digits.length) return
    setOtp([...digits, ...Array(6 - digits.length).fill('')])
    otpInputs.current[Math.min(digits.length, 6) - 1]?.focus()
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return showError('Please enter the 6-digit OTP.')

    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp: code })
      showSuccess('OTP verified successfully.')
      setStep(3)
    } catch (error) {
      showError(error?.response?.data?.message || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${serverUrl}/api/auth/forgot-password`, { email })
      setOtp(Array(6).fill(''))
      showSuccess(response.data.message || 'OTP has been sent to your email.')
      setTimeout(() => otpInputs.current[0]?.focus(), 0)
    } catch (error) {
      showError(error?.response?.data?.message || 'Unable to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    if (password.length < 6) return showError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return showError('Passwords do not match.')

    setLoading(true)
    try {
      const response = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, password, confirmPassword })
      showSuccess(response.data.message || 'Password updated successfully.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      showError(error?.response?.data?.message || 'Unable to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const title = step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'
  const subtitle = step === 1 ? 'Enter your registered email to receive a reset code.' : step === 2 ? `We sent a 6-digit code to ${email}.` : 'Choose a new password for your account.'
  const inputClass = `w-full py-4 rounded-xl outline-none transition-all duration-300 border-2 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 ${isDark ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' : 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400'}`

  return (
    <div className={`min-h-screen w-full flex items-center justify-center overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`} />
      </div>
      <Motion.main initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className={`relative z-10 w-full max-w-md mx-4 p-8 rounded-3xl backdrop-blur-xl shadow-2xl ${isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-white/60 border border-white/80'}`}>
        <button type="button" onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)} className={`mb-6 flex items-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            {step === 3 ? <Lock className="text-white" /> : step === 2 ? <KeyRound className="text-white" /> : <Mail className="text-white" />}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{subtitle}</p>
        </div>
        <AnimatePresence mode="wait">
          {step === 1 && <Motion.form key="email" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} onSubmit={submitEmail} className="space-y-5">
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address
              <div className="relative mt-2"><Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /><input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`${inputClass} pl-12 pr-4`} /></div>
            </label>
            <SubmitButton loading={loading}>Send OTP</SubmitButton>
          </Motion.form>}
          {step === 2 && <Motion.form key="otp" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} onSubmit={verifyOtp} className="space-y-6">
            <div onPaste={pasteOtp} className="flex justify-between gap-2">
              {otp.map((digit, index) => <input key={index} ref={(element) => { otpInputs.current[index] = element }} value={digit} onChange={(e) => updateOtp(e.target.value, index)} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputs.current[index - 1]?.focus() }} inputMode="numeric" maxLength="1" aria-label={`OTP digit ${index + 1}`} className={`w-11 h-14 rounded-xl text-center text-xl font-bold outline-none border-2 focus:border-blue-500 ${isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-white/80 border-slate-200 text-slate-800'}`} />)}
            </div>
            <SubmitButton loading={loading}>Verify OTP</SubmitButton>
            <button type="button" disabled={loading} onClick={resendOtp} className="w-full text-sm font-medium text-blue-500 hover:text-blue-600 disabled:opacity-60 flex justify-center items-center gap-2"><RotateCcw className="w-4 h-4" /> Resend OTP</button>
          </Motion.form>}
          {step === 3 && <Motion.form key="password" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} onSubmit={submitPassword} className="space-y-5">
            <PasswordField label="New Password" value={password} onChange={setPassword} inputClass={inputClass} isDark={isDark} />
            <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} inputClass={inputClass} isDark={isDark} />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password must be at least 6 characters.</p>
            <SubmitButton loading={loading}>Reset Password</SubmitButton>
          </Motion.form>}
        </AnimatePresence>
      </Motion.main>
    </div>
  )
}

function PasswordField({ label, value, onChange, inputClass, isDark }) {
  return <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}<div className="relative mt-2"><Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /><input required type="password" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} pl-12 pr-4`} /></div></label>
}

function SubmitButton({ children, loading }) {
  return <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70">{loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-5 h-5" />{children}</>}</button>
}

export default ForgotPassword
