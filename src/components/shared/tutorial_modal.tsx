'use client'

import { CircleCheck } from 'lucide-react';
import React, { useState } from 'react'
import ModalOverlay from '../excercise/ModalOverlay';
import { Tutorial } from '@/src/app/types/tutorial';

type TutorialModal = {
  showModal: boolean
  onClose: () => void
  tutorialContent: Tutorial[]
}


const Tutorial_modal = ({ showModal, onClose, tutorialContent }: TutorialModal) => {

  return (
    <ModalOverlay isOpen={showModal} onClose={() => {}}>
      {tutorialContent.map((item, index) => (
        <div className='w-130.5 h-61 rounded-2xl flex-row border border-gray-100 shadow-lg bg-white justify-center gap-4 p-8' key={index}>
          <div className='w-10 h-10 rounded-full bg-[#DCFAE6] flex items-center justify-center mb-4'>
            <CircleCheck color='#079455'/>
          </div>
          <div className='flex-row gap-2'>
            <h1 className='text-xl font-bold'>{item.title}</h1>
            <p>{item.description}</p>
          </div>
          <div className='flex justify-end'>
            <button onClick={() => onClose()} className='bg-[#0066CC] text-white w-23 h-10 rounded-md mt-8 hover:bg-[#0470dd]'>Let&apos;s Play</button>
          </div>
        </div>
      ))}
    </ModalOverlay>
  )
}

export default Tutorial_modal
