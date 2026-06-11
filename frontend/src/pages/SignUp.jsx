import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function SignUp() {
    let navigate=useNavigate()
    let [show,setShow]=useState(false)
let [userName,setUserName]=useState("")
let [email,setEmail]=useState("")
let [password,setPassword]=useState("")
let [loading,setLoading]=useState(false)
let [err,setErr]=useState("")
let dispatch=useDispatch()

    const handleSignUp=async (e)=>{
        e.preventDefault()
        setLoading(true)
        const nameRegex = /^[A-Za-z]+$/;
        if (!nameRegex.test(userName)) {
            setLoading(false)
            setErr("Name should contain alphabets only")
            return
        }
        try {
            let result = await axios.post(
                `${serverUrl}/api/auth/signup`,
                { userName, email, password },
                { withCredentials: true }
            )
            // Signup sends OTP — navigate to verification page with email prefilled
            // Signup only sends OTP and does not return a full user object yet.
            // Don't set user data here; navigate to verify page.
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
            setEmail("")
            setPassword("")
            setLoading(false)
            setErr("")
        } catch (error) {
            console.log(error)
            setLoading(false)
            setErr(error?.response?.data?.message)
        }
    }

  return (
    <div className='w-full h-[100vh] bg-bgMain flex items-center justify-center'>
     <div className='w-full max-w-[500px] h-[600px] bg-bgSurface rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-[30px]'>
        <div className='w-full h-[200px] bg-primary rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center'>
           <h1 className='text-textMain font-bold text-[30px]'>welcome to <span  className='text-white'>chatily</span></h1>
        </div>
        <form className='w-full flex flex-col gap-[20px] items-center' onSubmit={handleSignUp}>

        <input type="text" placeholder='username' className='w-[90%] h-[50px] outline-none border-2 border-primary px-[20px] py-[10px] bg-bgMain rounded-lg shadow-gray-200 shadow-lg text-textMain text-[19px]' onChange={(e)=>setUserName(e.target.value)} value={userName}/>
        <input type="email" placeholder='email' className='w-[90%] h-[50px] outline-none border-2 border-primary px-[20px] py-[10px] bg-bgMain rounded-lg shadow-gray-200 shadow-lg text-textMain text-[19px]'  onChange={(e)=>setEmail(e.target.value)} value={email}/>
        <div className='w-[90%] h-[50px] border-2 border-primary overflow-hidden rounded-lg shadow-gray-200 shadow-lg relative'>
        <input type={`${show?"text":"password"}`} placeholder='password' className='w-full h-full outline-none px-[20px] py-[10px] bg-bgMain text-textMain text-[19px]'  onChange={(e)=>setPassword(e.target.value)} value={password}/>
        <span className='absolute top-[10px] right-[20px] text-[19px] text-primary font-semibold cursor-pointer' onClick={()=>setShow(prev=>!prev)}>{`${show?"hidden":"show"}`}</span>
        </div>
        {err && <p className='text-red-500'>{"*" + err}</p>}
        <button className='px-[20px] py-[10px] bg-primary rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:opacity-80' disabled={loading}>{loading?"Loading...":"Sign Up"}</button>
        <p className='cursor-pointer text-textSub' onClick={()=>navigate("/login")}>Already Have An Account ? <span className='text-primary font-bold' >Login</span></p>
     </form>
     </div>
     
    </div>
  )
}

export default SignUp
