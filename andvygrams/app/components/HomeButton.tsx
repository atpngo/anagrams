'use client'
import { ReactElement } from "react"
import { motion } from "framer-motion"

type ButtonProps = {
    name: string,
    children: ReactElement
}


export default function HomeButton({name, children}: ButtonProps)
{
    return(
        <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 1.1 }} 
            className="flex flex-col justify-center items-center md:h-60 md:w-80 h-32 w-60 border-solid border-4 rounded-xl bg-btn-pink border-white space-y-1"
        >
            {children}
            <p className="text-white md:text-[35px] text-[20px]">{name}</p>
        </motion.div>
    )
}