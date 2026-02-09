import React from 'react'

// type Props = {}

export default function StatusNode() {
    return (
        <div className='bg-white border border-gray-100 shadow-lg w-auto h-auto flex rounded-2xl gap-4 p-2'>
            <div className='flex items-center gap-2'>
                <div className='rounded-full bg-[#62A2F7] w-3 h-3 mx-auto'/>
                <p className='text-gray-500 font-medium'>Current State</p>
            </div>
            <div className='flex items-center gap-2'>
                <div className='rounded-full bg-[#F19F72] w-3 h-3 mx-auto'/>
                <p className='text-gray-500 font-medium'>Processing</p>
            </div>
        </div>
    )
}