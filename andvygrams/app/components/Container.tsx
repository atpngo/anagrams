'use client'
import { ReactElement } from "react"

type ContainerProps = {
    children: ReactElement | ReactElement[],
}

export default function Container({children} : ContainerProps)
{
    return (
        <div className="flex justify-center items-center w-[320px] h-max[200px] md:h-full rounded-xl border-white border-8 bg-alt-pink text-white">
            {children}
        </div>
    )
}