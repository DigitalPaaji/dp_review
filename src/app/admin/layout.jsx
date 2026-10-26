"use client"
import React from 'react'
import SliderAdmin from './SliderAdmin'
import axios from 'axios'

axios.defaults.withCredentials = true;


const layout = ({children}) => {

const handelLogout = async()=>{
  try {
    const response = await axios.post(`/api/auth/logout`)
    const data = await response.data;
    if(data.success){
      location.href="/"
    }

  } catch (error) {
    
  }
}



  return (
    <div className='flex '>
        <SliderAdmin handelLogout={handelLogout} />
        
     <div className='flex-1'>
           {children}
     </div>

    </div>
  )
}

export default layout