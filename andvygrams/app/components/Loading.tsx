'use client'
import { IoExtensionPuzzleSharp } from "react-icons/io5"
import { motion } from "framer-motion"

export default function Loading()
{
    return (
        <div className="w-screen h-screen flex justify-center items-center z-10">
            <div className="absolute w-screen h-screen opacity-10 bg-white">

            </div>
            <motion.div
                className="opacity-100 z-20"
                animate={{
                    scale: [2, 1, 2, 1, 2],
                    rotate: [0, 90, 180, 270, 360],
                    color: ['hsl(331, 87, 64)', 'hsl(61, 78, 63)', 'hsl(191, 75, 65)', 'hsl(119, 59, 53)', 'hsl(331, 87, 64)']
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    // times: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
                    times: [0, 0.25, 0.5, 0.75, 1.0],
                    repeat: Infinity,
                    repeatDelay: 0
                  }}
            >
                <IoExtensionPuzzleSharp size={100} className="opacity-100"/>
            </motion.div>
        </div>
    )
}