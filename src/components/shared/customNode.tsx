import React, { memo } from 'react'

type customStyle = {
    dataNode: { label: number };
}

const CustomNode = ({dataNode}: customStyle) => {
    return (
        <div className="flex justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg cursor-grab">
            {dataNode.label}
        </div>
    )
}

export default memo(CustomNode);