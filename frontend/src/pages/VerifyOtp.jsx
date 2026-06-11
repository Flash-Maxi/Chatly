import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function VerifyOtp(){
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const params = new URLSearchParams(location.search)
    const prefillEmail = params.get('email') || ''

    const [email, setEmail] = useState(prefillEmail)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [resendMessage, setResendMessage] = useState('')
    const [cooldown, setCooldown] = useState(0)

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

    useEffect(()=>{
        if(prefillEmail) setEmail(prefillEmail)
    },[prefillEmail])

    const handleVerify = async (e) =>{
        e.preventDefault()
        setLoading(true)
        setErr('')
        try{
            const res = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
            // Backend sets cookie and returns user
            dispatch(setUserData(res.data.user))
            setLoading(false)
            navigate('/')
        }catch(error){
            setLoading(false)
            setErr(error?.response?.data?.message || 'Verification failed')
        }
    }

    const handleResend = async () => {
        if (!email) return setResendMessage('Enter your email first')
        setResendLoading(true)
        setResendMessage('')
        try{
            const res = await axios.post(`${serverUrl}/api/auth/resend-otp`, { email })
            setResendMessage(res.data.message || 'OTP resent')
            // start cooldown (matches server minimum interval of 60s)
            const until = Date.now() + 60 * 1000
            try {
                localStorage.setItem(cooldownKey(email), String(until))
            } catch (err) {
                console.warn('could not persist cooldown', err)
            }
            setCooldown(60)
        }catch(error){
            setResendMessage(error?.response?.data?.message || 'Failed to resend')
        }
        setResendLoading(false)
    }

    return (
        <div className='w-full h-[100vh] bg-bgMain flex items-center justify-center'>
            <div className='w-full max-w-[500px] h-[400px] bg-bgSurface rounded-lg shadow-lg flex flex-col gap-[20px] items-center justify-center'>
                <h2 className='text-2xl font-bold'>Verify your account</h2>
                <form className='w-[90%] flex flex-col gap-4' onSubmit={handleVerify}>
                    <input type='email' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} className='w-full h-12 px-4 rounded border'/>
                    <input type='text' placeholder='Enter OTP' value={otp} onChange={(e)=>setOtp(e.target.value)} className='w-full h-12 px-4 rounded border'/>
                    {err && <p className='text-red-500'>{err}</p>}
                    <div className='flex gap-2'>
                        <button className='px-4 py-2 bg-primary text-white rounded' disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
                        <button type='button' onClick={handleResend} className='px-4 py-2 bg-secondary text-white rounded' disabled={resendLoading || cooldown>0}>{resendLoading ? 'Resending...' : (cooldown>0 ? `Resend in ${cooldown}s` : 'Resend OTP')}</button>
                    </div>
                    {resendMessage && <p className='text-green-500'>{resendMessage}</p>}
                </form>
            </div>
        </div>
    )
}

export default VerifyOtp
