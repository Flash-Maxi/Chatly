import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUser, setUserData } from '../redux/userSlice'

function Login() {
    let navigate=useNavigate()
    let [show,setShow]=useState(false)
    let [email,setEmail]=useState("")
    let [password,setPassword]=useState("")
    let [loading,setLoading]=useState(false)
    let [err,setErr]=useState("")
    let dispatch=useDispatch()
    
        const handleLogin=async (e)=>{
            e.preventDefault()
            setLoading(true)
            try {
                let result =await axios.post(`${serverUrl}/api/auth/login`,{
    email,password
                },{withCredentials:true})
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
                    const msg = error?.response?.data?.message || ''
                    // If backend asks to verify email, redirect to verify page with email prefilled
                    if (msg.toLowerCase().includes('verify')) {
                        // show message briefly then redirect to verify page
                        setErr(msg)
                        setTimeout(() => {
                            navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
                        }, 1200)
                        return
                    }
                    setErr(msg)
            }
        }
    
  return (
    <div className='w-full h-[100vh] bg-bgMain flex items-center justify-center'>
     <div className='w-full max-w-[500px] h-[600px] bg-bgSurface rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-[30px]'>
        <div className='w-full h-[200px] bg-primary rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center'>
           <h1 className='text-textMain font-bold text-[30px]'>Login to <span  className='text-white'>chatily</span></h1>
        </div>
        <form className='w-full flex flex-col gap-[20px] items-center' onSubmit={handleLogin}>
        <input type="email" placeholder='email' className='w-[90%] h-[50px] outline-none border-2 border-primary px-[20px] py-[10px] bg-bgMain rounded-lg shadow-gray-200 shadow-lg text-textMain text-[19px]' onChange={(e)=>setEmail(e.target.value)} value={email}/>
        <div className='w-[90%] h-[50px] border-2 border-primary overflow-hidden rounded-lg shadow-gray-200 shadow-lg relative'>
        <input type={`${show?"text":"password"}`} placeholder='password' className='w-full h-full outline-none px-[20px] py-[10px] bg-bgMain text-textMain text-[19px]' onChange={(e)=>setPassword(e.target.value)} value={password}/>
        <span className='absolute top-[10px] right-[20px] text-[19px] text-primary font-semibold cursor-pointer' onClick={()=>setShow(prev=>!prev)}>{`${show?"hidden":"show"}`}</span>
        </div>
{err && <p className='text-red-500'>{"*" + err}</p>}
        <button className='px-[20px] py-[10px] bg-primary rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:opacity-80' disabled={loading}>{loading?"Loading...":"Login"}</button>
        <p className='cursor-pointer text-textSub' onClick={()=>navigate("/signup")}>Want to create a new account ? <span className='text-primary font-bold' >sign up</span></p>
     </form>
     </div>
     
    </div>
  )
}

export default Login
