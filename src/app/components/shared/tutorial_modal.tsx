'use client'

import { CircleCheck } from 'lucide-react';
import React, { useState } from 'react'


const Tutorial_modal = () => {

  const [showModal, setShowModal] = useState(true);

  if (!showModal) return null;

  return (
    <div className='w-[522px] h-[244px] rounded-2xl flex-row border border-gray-100 shadow-lg bg-white justify-center gap-4 p-8'>
      <div className='w-[40px] h-[40px] rounded-full bg-[#DCFAE6] flex items-center justify-center mb-4'>
        <CircleCheck color='#079455'/>
      </div>
      <div className='flex-row gap-2'>
        <h1 className='text-xl font-bold'>Tutorial Complete!</h1>
        <p>You are ready to play.</p>
      </div>
      <div className='flex justify-end'>
        <button onClick={() => setShowModal(false)} className='bg-[#0066CC] text-white w-[92px] h-[40px] rounded-md mt-8 hover:bg-[#0470dd]'>Let&apos;s Play</button>
      </div>
    </div>
  )
}

export default Tutorial_modal