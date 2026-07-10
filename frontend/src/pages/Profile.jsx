import React, { useRef, useState, useEffect } from 'react'
import dp from "../assets/dp.webp"
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../main';
import { setUserData } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
function Profile() {
    let { userData } = useSelector(state => state.user)
    let dispatch = useDispatch()
    let navigate = useNavigate()
    let [name, setName] = useState(userData.name || "")
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

    let [frontendImage, setFrontendImage] = useState(dp)
    let [backendImage, setBackendImage] = useState(null)
    let image = useRef()
    let [saving, setSaving] = useState(false)
    let [err, setErr] = useState("")

    useEffect(() => {
        if (userData?.image) {
            setFrontendImage(getImageUrl(userData.image))
        } else {
            setFrontendImage(dp)
        }
    }, [userData])
    const handleImage = (e) => {
        let file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleProfile = async (e) => {

        e.preventDefault()
        setSaving(true)
        const nameRegex = /^[A-Za-z ]+$/
        if (name && !nameRegex.test(name)) {
            setErr("Name should contain alphabets and spaces only")
            setSaving(false)
            return
        }
        try {

            let formData = new FormData()
            formData.append("name", name)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            let result = await axios.put(`${serverUrl}/api/user/profile`, formData, { withCredentials: true })
            setSaving(false)
            dispatch(setUserData(result.data))
            navigate("/")
        } catch (error) {
            console.log(error)
            setSaving(false)
            setErr(error?.response?.data?.message || "Profile update failed")
            if (backendImage) {
                setBackendImage(null)
                setFrontendImage(userData?.image ? getImageUrl(userData.image) : dp)
                if (image.current) image.current.value = ''
            }
        }
    }

    const fieldVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        })
    }

    return (
        <div className='relative w-full min-h-[100vh] bg-bgMain overflow-hidden flex flex-col justify-center items-center gap-[20px] px-4 py-10 sm:py-16'>
            {/* Ambient gradient backdrop */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden="true">
                <div className='absolute -top-24 -left-24 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-primary/30 blur-[110px]' />
                <div className='absolute -bottom-24 -right-16 w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-primary/20 blur-[110px]' />
            </div>

            {/* Back button */}
            <motion.button
                type="button"
                aria-label="Go back"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className='fixed top-[20px] left-[20px] z-20 cursor-pointer rounded-full p-1 bg-bgSurface/60 backdrop-blur-md border border-white/10 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                onClick={() => navigate("/")}
            >
                <IoIosArrowRoundBack className='w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] text-textMain' />
            </motion.button>

            {/* Main card */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className='relative z-10 w-full max-w-[520px] flex flex-col items-center gap-[28px] rounded-3xl border border-white/10 bg-bgSurface/40 backdrop-blur-xl shadow-2xl shadow-black/10 px-6 py-10 sm:px-10 sm:py-12'
            >
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-semibold tracking-tight text-textMain'>Edit profile</h1>
                    <p className='text-sm text-textSub'>Update your photo and display name</p>
                </div>

                {/* Avatar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.03 }}
                    role="button"
                    tabIndex={0}
                    aria-label="Change profile photo"
                    onClick={() => image.current.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); image.current.click() } }}
                    className='group cursor-pointer relative rounded-full p-[3px] bg-gradient-to-tr from-primary via-primary/60 to-primary/20 shadow-lg shadow-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bgMain'
                >
                    <div className='w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full overflow-hidden flex justify-center items-center bg-gray-600 ring-4 ring-bgMain'>
                        <img
                            src={frontendImage}
                            alt="Profile"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.src = dp;
                            }}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className='absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors duration-300' />
                    </div>
                    <div className='absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-primary flex justify-center items-center shadow-lg shadow-black/20 border-2 border-bgMain transition-transform duration-300 group-hover:scale-110'>
                        <IoCameraOutline className='text-white w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]' />
                    </div>
                </motion.div>

                <form className='w-full flex flex-col gap-[18px] items-center justify-center' onSubmit={handleProfile}>
                    <input type="file" accept='image/*' ref={image} hidden onChange={handleImage} />

                    <motion.div className='w-full flex flex-col gap-[8px]' custom={0} initial="hidden" animate="visible" variants={fieldVariants}>
                        <label htmlFor="displayName" className='text-xs font-medium uppercase tracking-wide text-textSub pl-1'>Display name</label>
                        <input
                            id="displayName"
                            type="text"
                            placeholder="Display Name"
                            aria-label="Display Name"
                            className='w-full h-[52px] outline-none border-2 border-primary/60 px-[20px] py-[10px] bg-bgSurface/70 rounded-xl shadow-sm text-textMain text-[17px] sm:text-[19px] transition-all duration-200 focus:border-primary focus:shadow-md focus:shadow-primary/20'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                        <p className='text-xs sm:text-sm text-textSub pl-1'>This name will be visible to other users.</p>
                    </motion.div>

                    <AnimatePresence>
                        {err && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                role="alert"
                                className='text-red-500 text-sm w-full text-center overflow-hidden'
                            >
                                {err}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.div className='w-full flex flex-col gap-[8px]' custom={1} initial="hidden" animate="visible" variants={fieldVariants}>
                        <label htmlFor="userName" className='text-xs font-medium uppercase tracking-wide text-textSub pl-1'>Username</label>
                        <input
                            id="userName"
                            type="text"
                            readOnly
                            aria-label="Username"
                            className='w-full h-[52px] outline-none border-2 border-primary/30 px-[20px] py-[10px] bg-bgSurface/40 rounded-xl shadow-sm text-textSub text-[17px] sm:text-[19px] cursor-not-allowed'
                            value={userData?.userName}
                        />
                        <p className='text-xs sm:text-sm text-textSub pl-1'>Username is unique and cannot be changed.</p>
                    </motion.div>

                    <motion.div className='w-full flex flex-col gap-[8px]' custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
                        <label htmlFor="email" className='text-xs font-medium uppercase tracking-wide text-textSub pl-1'>Email</label>
                        <input
                            id="email"
                            type="email"
                            readOnly
                            aria-label="Email"
                            className='w-full h-[52px] outline-none border-2 border-primary/30 px-[20px] py-[10px] bg-bgSurface/40 rounded-xl shadow-sm text-textSub text-[17px] sm:text-[19px] cursor-not-allowed'
                            value={userData?.email}
                        />
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={saving}
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={fieldVariants}
                        whileHover={{ scale: saving ? 1 : 1.03 }}
                        whileTap={{ scale: saving ? 1 : 0.97 }}
                        className='px-[24px] py-[12px] bg-primary rounded-2xl shadow-lg shadow-primary/30 text-[18px] sm:text-[20px] w-full max-w-[220px] mt-[10px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bgMain'
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )
}

export default Profile