'use client'

import { motion } from "framer-motion"
import { ReactNode, useEffect, useState } from "react"
type LetterTileProps = {
    letter: string,
    isPressed: boolean,
    onActivate: () => void,
}

export default function LetterTile({letter, isPressed, onActivate} : LetterTileProps)
{
    const [state, setState] = useState(isPressed);
    useEffect(() => {
        setState(isPressed);
    }, [isPressed])
    return (
        <motion.div 
        style={{
            scale: isPressed ? 0.9 : 1.0,
            transition: "all .05s ease-in-out",
            visibility: (letter === "") ? "hidden" : "visible"
        }}
        whileHover={{scale: 1.2}}
        whileTap={{scale: 1.1}} 
        className="flex justify-center items-center text-white bg-alt-pink border-4 rounded-sm w-14 h-14 text-[40px] cursor-pointer select-none md:w-20 md:h-20 md:text-[60px]"
        onClick={onActivate}
        >
            {letter}
        </motion.div>
    )
}