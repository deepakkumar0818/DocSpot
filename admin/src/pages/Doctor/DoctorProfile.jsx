import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, setProfileData,backendUrl } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  // Fetch profile data when dToken changes
  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

 const updateProfile = async () => {
 try {
   const updateData = {
      fees: profileData.fees,
      available: profileData.available
   }
   const { data } = await axios.post(`${backendUrl}/api/doctors/update-profile`, updateData, {
      headers: {
       dToken
      }
   })
   if (data.success) {
    toast.success(data.message);
    setIsEdit(false);
    getProfileData();
   }else{
    toast.error(data.message);
   }
 } catch (error) {
  console.log(error);
  toast.error(error.message);
  
 }
    
 }
 

  return profileData && (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="Profile" />
      </div>
      <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white m-5'>
        <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
          {profileData.name}
        </p>
        <div className='flex items-center gap-2 mt-1 text-gray-600'>
          <p>{profileData.degree} - {profileData.speciality}</p>
          <button className='py-0.5 px-2 text-xs rounded-full'>{profileData.experience}</button>
        </div>
        <div>
          <p className='flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3'>About:</p>
          <p className='text-gray-600 text-sm max-w-[700px] mt-1'>{profileData.about}</p>
        </div>
        <p className='font-medium text-gray-600 mt-4'>
          Appointment fee:
          <span className='text-gray-800'>{currency}
            {isEdit ? (
              <input
                type="number"
                onChange={ (e) => {
                  setProfileData(prev => ({ ...prev, fees: e.target.value }));
                }}
                value={profileData.fees}
                className="border rounded p-1"
              />
            ) : (
              profileData.fees
            )}
          </span>
        </p>
        <div className='flex gap-2 py-2'>
          <p>Address:</p>
          <p>{profileData.address.line1}<br />{profileData.address.line2}</p>
        </div>
        <div className='flex gap-1 pt-2'>
          <input 
            checked={profileData.available} 
            type="checkbox" 
            onChange={ (e) => {
              isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }));
            }} 
          />
          <label htmlFor=""> Available</label>
        </div>
        <div>

        {
  isEdit ? (
    <button onClick={updateProfile} className='py-1 px-4 text-sm border border-primary rounded-full mt-5 hover:text-white hover:bg-primary transition-all duration-300'>
      Save
    </button>
  ) : (
    <button onClick={() => setIsEdit(true)} className='py-1 px-4 text-sm border border-primary rounded-full mt-5 hover:text-white hover:bg-primary transition-all duration-300'>
      Edit
    </button>
  )
}

         
           
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
