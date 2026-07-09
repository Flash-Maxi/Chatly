import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../main";
import { useDispatch, useSelector } from "react-redux";
import { setOtherUsers } from "../redux/userSlice";

const getOtherUsers = () => {
    let dispatch = useDispatch();
    let { userData } = useSelector((state) => state.user);
    useEffect(() => {
        if (!userData) return; // Don't call API if not logged in
        const fetchUser = async () => {
            try {
                let result = await axios.get(`${serverUrl}/api/user/others`, { withCredentials: true });
                dispatch(setOtherUsers(result.data));
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 400) {
                    dispatch(setOtherUsers([])); // Clear users if unauthorized
                    return;
                }
                console.log(error);
            }
        };
        fetchUser();
    }, [userData]);
};

export default getOtherUsers;