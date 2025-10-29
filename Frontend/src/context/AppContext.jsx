import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const currencySymbol = "$";
    
    // Get backend URL with fallback for development
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                      (import.meta.env.DEV ? 'http://localhost:4000' : '');
    
    // Log backend URL for debugging (only in development)
    if (import.meta.env.DEV) {
        console.log('🔗 Backend URL:', backendUrl || 'NOT SET - Using fallback');
    }

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
        // Validate backend URL
        if (!backendUrl) {
            console.error('❌ Backend URL is not configured!');
            console.error('Please set VITE_BACKEND_URL in your .env file');
            toast.error('Backend URL not configured. Please check environment variables.');
            return;
        }

        try {
            const apiUrl = `${backendUrl}/api/doctors/list`;
            console.log('🔄 Fetching doctors from:', apiUrl);
            
            const { data } = await axios.get(apiUrl);
            console.log('📥 API Response:', data);
            
            if (data.success) {
                const doctorCount = data.doctors?.length || 0;
                console.log(`✅ Received ${doctorCount} doctors from database: ${data.debug?.dbName || 'unknown'}`);
                
                if (data.debug) {
                    console.log('🔍 Debug Info:', {
                        database: data.debug.dbName,
                        collection: data.debug.collectionName,
                        totalCount: data.debug.totalCount,
                        returned: data.debug.returned
                    });
                }
                
                setDoctors(data.doctors || []);
                
                if (doctorCount === 0) {
                    console.warn('⚠️ No doctors returned from API');
                    console.warn('This could mean:');
                    console.warn('  1. No doctors in the database');
                    console.warn('  2. Wrong database being accessed');
                    console.warn('  3. Connection issue');
                }
            } else {
                console.error('❌ API returned error:', data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('❌ Error fetching doctors:', error);
            const errorDetails = {
                message: error.message,
                url: `${backendUrl}/api/doctors/list`,
                response: error.response?.data,
                status: error.response?.status
            };
            console.error('Error details:', errorDetails);
            
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                toast.error(`Cannot connect to backend at ${backendUrl}. Please check if the server is running.`);
            } else {
                toast.error(error.message || 'Failed to fetch doctors');
            }
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
