'use client'
import React from 'react'
import { X } from 'lucide-react'
import ModalOverlay from '../excercise/ModalOverlay';
import type { Exercise } from '@/src/app/types/exercise';

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

/* ---------------- Mock Data ---------------- */
const Reading_Mock = {
    id: "1",
    title: "SINGLY LINKED LIST",
    sections: [
        {
        heading: "WHAT IS SINGLY LINKED LIST?",
        content: [
            "A Singly Linked List is a linear data structure where each element (node) contains data and a pointer to the next node.",
            "Unlike arrays, linked lists don't have fixed sizes and allow efficient insertion/deletion at any position.",
            "The list maintains a head pointer that points to the first node. The last node's next pointer is null, indicating the end of the list.",
            "This structure provides O(1) insertion/deletion at the head but O(n) access time for arbitrary elements.",
            "Singly linked lists are fundamental building blocks for more complex data structures like stacks, queues, and adjacency lists for graphs.",
        ],
        },
        {
        heading: "INSERTION PROCESS",
        list: [
            "Create new node with given data",
            "Set new node's next to current head",
            "Update head pointer to new node",
            "Increment list size counter",
        ],
        },
        {
        heading: "DELETION PROCESS",
        list: [
            "Check if list is empty (head === null)",
            "If deleting head, update head to head.next",
            "Otherwise traverse to previous node",
            "Update previous.next to skip deleted node",
            "Decrement list size counter",
        ],
        },
    ],
};

function Reading_modal({ isOpen, onClose }: Props) {
    const data = Reading_Mock;
    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div className='w-132 h-146 bg-white border border-gray-300 rounded-lg p-4 overflow-auto'>
                <div className='flex justify-end'>
                    <X className='cursor-pointer' onClick={onClose}/>
                </div>
                {data.sections.map((section, index) => (
                    <div key={index} className='p-2 mt-2'>
                        <div className='flex gap-1 items-center mb-2'>
                            <div className='h-8 w-2 bg-blue-600'></div>
                            <h2 className='text-xl font-bold '>{section.heading}</h2>
                        </div>
                        {section.content && section.content.map((paragraph, pIndex) => (
                            <p key={pIndex} className='mb-2 text-justify'>{paragraph}</p>
                        ))}
                        {section.list && (
                            <ul className='list-disc list-inside'>
                                {section.list.map((item, lIndex) => (
                                    <li key={lIndex} className='mb-1'>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </ModalOverlay>
    )
}

export default Reading_modal;