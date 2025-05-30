'use client'
import { useEffect, useState } from "react"
import { socket } from "../components/Socket"

import { useRouter } from "next/navigation";

export default function Page()
{
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [events, setEvents] = useState<any>([]);
    const [room, setRoom] = useState('');

    useEffect(() => {
        socket.connect()
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onEvent(value: any) {
            setEvents((prev: any) => [...prev, value]);
        }

        function onRoom(value: any) {
            setRoom(value)
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        socket.on('someEvent', onEvent)
        socket.on('requestRoomResponse', onRoom)
        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            socket.off('someEvent', onEvent)
            socket.off('requestRoomResponse', onRoom)
        }
    }, [])
    return (
        <div className="z-[1000]">
            <div className="flex flex-col gap-2">
                <p className="text-xl text-white">{room}</p>
                <button className="rounded-lg border-white border-4 bg-green-200" onClick={() => {
                    if (socket)
                    {
                        // leave any current rooms


                        socket.emit("requestRoom");
                    }
                }}>GENERATE ROOM</button>
                <button className="rounded-lg border-white border-4 bg-green-200" onClick={() => {
                    if (socket)
                    {
                        socket.emit("test", "hello this is my message", (res: any) => {console.log(res.status)})
                    }
                }}>click me</button>
            </div>
        </div>
    )
}