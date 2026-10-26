"use client"
import React from 'react'
import SliderClient from './SliderClient'

const layout = ({children}) => {
  return (
  <div className='flex '>
          {/* <SliderClient /> */}
          
       <div className='flex-1'>
             {children}
       </div>
  
      </div>
  )
}

export default layout