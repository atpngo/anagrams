import { motion, AnimatePresence } from 'framer-motion'
import { ReactElement, useEffect, useState } from 'react'

type ToastProps = {
    show: boolean,
    setShow: (arg: boolean) => void,
    children: ReactElement | ReactElement[]
}

export default function Toast({show, setShow, children}: ToastProps)
{
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(show)
        if (show === true)
        {
            setTimeout(() => {
                setShow(false)
            }, 1000)
        }
    }, [show])

    return (
        <AnimatePresence>
            {show && <motion.div 
                style={{zIndex: 10}}
                key='toast'
                initial={{scale: 0}}
                animate={{scale: 1}}
                transition={{duration: 0.25}}
                exit={{scale: 0}}
                className='fixed w-[200px] h-[45px] p-0 m-0 md:w-[300px]'
            >
                {children}
            </motion.div>}
        </AnimatePresence>
    )
}