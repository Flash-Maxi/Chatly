import axios from "axios";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { serverUrl } from "../main";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const getCurrentUser = () => {
    let dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Skip fetching current user while on the verify-otp page to avoid repeated 401s
        if (location.pathname && location.pathname.startsWith('/verify-otp')) return;

        const fetchUser = async () => {
            try {
                let result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
                dispatch(setUserData(result.data));
            } catch (error) {
                if (error.response?.status === 401) {
                    dispatch(setUserData(null));
                    return;
                }
                console.log(error);
            }
        };
        fetchUser();
    }, [dispatch, location.pathname]);
};

export default getCurrentUser;