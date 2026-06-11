import React, { useRef, useState, useEffect } from 'react'
import dp from "../assets/dp.webp"
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../main';
import { setUserData } from '../redux/userSlice';
function Profile() {
    let {userData}=useSelector(state=>state.user)
    let dispatch=useDispatch()
    let navigate=useNavigate()
let [name,setName]=useState(userData.name || "")
const getImageUrl = (imagePath) => {
    if (!imagePath) return dp;

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    return `${serverUrl}${imagePath}`;
};

let [frontendImage,setFrontendImage]=useState(dp)
let [backendImage,setBackendImage]=useState(null)
let image=useRef()
let [saving,setSaving]=useState(false)
let [err,setErr]=useState("")

useEffect(()=>{
        if(userData?.image){
                setFrontendImage(getImageUrl(userData.image))
        } else {
                setFrontendImage(dp)
        }
},[userData])
const handleImage=(e)=>{
    let file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
}

const handleProfile=async (e)=>{
   
e.preventDefault()
setSaving(true)
const nameRegex = /^[A-Za-z ]+$/
if (name && !nameRegex.test(name)){
    setErr("Name should contain alphabets and spaces only")
    setSaving(false)
    return
}
try {

    let formData=new FormData()
    formData.append("name",name)
    if(backendImage){
        formData.append("image",backendImage) 
    }
    let result=await axios.put(`${serverUrl}/api/user/profile`,formData,{withCredentials:true})
    setSaving(false)
    dispatch(setUserData(result.data))
    navigate("/")
} catch (error) {
    console.log(error)
    setSaving(false)
    setErr(error?.response?.data?.message || "Profile update failed")
}
}
  return (
    <div className='w-full h-[100vh] bg-bgMain flex flex-col justify-center items-center gap-[20px]'>
        <div className='fixed top-[20px] left-[20px] cursor-pointer' onClick={()=>navigate("/")}>
        <IoIosArrowRoundBack className='w-[50px] h-[50px] text-textMain'/>
        </div>
     <div className=' bg-gray-600 rounded-full border-4 border-primary shadow-gray-400 shadow-lg  relative' onClick={()=>image.current.click()}>
<div className='w-[200px] h-[200px] rounded-full overflow-hidden flex justify-center items-center'>
<img
    src={frontendImage}
    alt="Profile"
    loading="lazy"
    onError={(e) => {
        e.currentTarget.src = dp;
    }}
    className="w-full h-full object-cover"
/>
</div>
<div className='absolute bottom-4 text-textMain right-4 w-[35px] h-[35px] rounded-full bg-primary flex justify-center items-center shadow-gray-400 shadow-lg'>
<IoCameraOutline className='text-white w-[25px] h-[25px]'/>
</div>
     </div>
     <form className='w-[95%]  max-w-[500px] flex flex-col gap-[20px] items-center justify-center' onSubmit={handleProfile}>
        <input type="file" accept='image/*' ref={image} hidden onChange={handleImage}/>
        <input type="text" placeholder="Display Name" aria-label="Display Name" className='w-[90%] h-[50px] outline-none border-2 border-primary px-[20px] py-[10px] bg-bgSurface rounded-lg shadow-gray-400 shadow-lg text-textMain text-[19px]' onChange={(e)=>setName(e.target.value)} value={name}/>
        <p className='text-sm text-textSub w-[90%]'>This name will be visible to other users.</p>
        {err && <p className='text-red-500'>{err}</p>}
        <input type="text"  readOnly className='w-[90%] h-[50px] outline-none border-2 border-primary px-[20px] py-[10px] bg-bgSurface rounded-lg shadow-gray-400 shadow-lg text-textSub text-[19px]' value={userData?.userName}/>
        <p className='text-sm text-textSub w-[90%]'>Username is unique and cannot be changed.</p>
        <input type="email" readOnly className='w-[90%] h-[50px] outline-none border-2 border-primary px-[20px] py-[10px] bg-bgSurface rounded-lg shadow-gray-400 shadow-lg text-textSub text-[19px]' value={userData?.email}/>
        <button className='px-[20px] py-[10px] bg-primary rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:opacity-80' disabled={saving}>{saving?"Saving...":"Save Profile"}</button>
     </form>
    </div>
  )
}

export default Profile
