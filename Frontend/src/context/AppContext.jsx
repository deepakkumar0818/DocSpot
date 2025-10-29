import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const currencySymbol = "$";
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || false);
    const [userData, setUserData] = useState(false);

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/users/get-profile`, {
                headers: { token },
            });
            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const getDoctorsData = async () => {
        try {
            console.log('🔄 Fetching doctors from:', `${backendUrl}/api/doctors/list`);
            const { data } = await axios.get(`${backendUrl}/api/doctors/list`);
            console.log('📥 API Response:', data);
            
            if (data.success) {
                console.log(`✅ Received ${data.doctors?.length || 0} doctors`);
                if (data.debug) {
                    console.log('🔍 Debug Info:', data.debug);
                }
                setDoctors(data.doctors || []);
                
                if (!data.doctors || data.doctors.length === 0) {
                    console.warn('⚠️ No doctors returned from API');
                }
            } else {
                console.error('❌ API returned error:', data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('❌ Error fetching doctors:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error(error.message || 'Failed to fetch doctors');
        }
    };

    useEffect(() => {
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token]);

    const value = {
        doctors,getDoctorsData,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
