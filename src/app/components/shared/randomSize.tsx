'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react';


const RandomSize = () => {
    const [inputValue, setInputValue] = useState<string>('');

    const handleRandomClick = () => {
        const randomNum = Math.floor(Math.random() * 30) + 1;
        setInputValue(randomNum.toString());
    };

    const handleReset = () => {
        setInputValue('');
    };

    return (
        <>
            <div className='grid-cols-1 grid gap-2 text-start m-1'>
                <p className='font-bold text-md'>Random Size</p>
                <div className='flex gap-2'>
                    <input type="number" className='border border-gray-200 p-2 rounded-lg w-80' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    <button className='bg-[#222121] rounded-lg p-2' onClick={handleRandomClick}>
                        <Plus color='white'/>
                    </button>
                </div>
                <button className='bg-[#222121] text-white text-center p-2 rounded-lg' onClick={handleReset}>Reset All</button>
            </div>
        </>
    )
}

export default RandomSize