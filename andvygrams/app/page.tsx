'use client'
import Image from "next/image";
import HomeButton from "./components/HomeButton";
import {BsPersonFill, BsFillPuzzleFill, BsPeopleFill} from "react-icons/bs"
import { useEffect, useState } from "react"
import { socket } from "./components/Socket";
import Link from "next/link"
import SpringModal from "./components/SpringModal";
import { motion } from "framer-motion"
import { useRouter } from "next/navigation";
import { MutatingDots } from 'react-loader-spinner'

export default function Home()
{
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [latency, setLatency] = useState(0);
  useEffect(() => {
    socket.connect();
    function onConnect() {
      console.log("we connected")
      setIsConnected(true);
      startPinging();
      console.log("we pinging in this b-word")
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRoom(value: any)
    {
      // go to that room
      router.push('/multiplayer/' + value)
      setWaiting(false);
    }

    function onLatency(serverLatency: number) {
      setLatency(serverLatency)
    }

    function onPing(originalTime: number)
    {
      let latency = (Date.now()-originalTime);
      setLatency(latency);
    }

    function startPinging() {
      setInterval(() => {
          console.log("sending ping...")
          socket.emit('pingServer', Date.now() );
      }, 5000);  // Ping every 5 seconds
    }


    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('requestRoomResponse', onRoom)
    socket.on('pingFromServer', onPing)
    socket.on('latency', onLatency)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('requestRoomResponse', onRoom)
      socket.off('pingFromServer', onPing)
      socket.off('latency', onLatency)


    }
  }, [])


  return (
    <div className="flex min-h-screen flex-col items-center p-5 z-10 justify-evenly">
      {/* multiplayer modal */}
      <SpringModal open={open} handleClose={() => setOpen(false)}>
        <div className="flex border-white rounded-xl border-8 flex-col w-[350px] lg:w-[560px] h-[450px] bg-alt-pink text-white items-center justify-center lg:p-4 p-2">
          <p className="text-[50px] lg:text-[60px] pb-4">MULTIPLAYER</p>
          {waiting && <div className="text-xl flex flex-col justify-center items-center w-full">
              {/* loading */}
              <p>Finding a room...</p>
              <MutatingDots 
                height="100"
                width="100"
                color="#ffffff"
                secondaryColor= '#ffffff'
                radius='13.5'
                ariaLabel="mutating-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
          </div>}
          {!waiting && <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col">
              <p className="text-lg">Enter Code:</p>
              <div className="flex gap-2">
                {/* text box placeholder */}
                <input 
                  className="w-[200px] h-[50px] bg-white rounded-xl text-black flex justify-center items-center text-[40px] drop-shadow-lg text-center"
                  onChange={(e) => {setRoomCode(e.target.value)}}
                />
                <motion.div 
                  className="flex rounded-lg h-[50px] w-[100px] items-center justify-center border-white border-4 bg-[#54A7F3] text-white text-2xl drop-shadow-lg"
                  whileHover={{scale: 1.15}}
                  whileTap={{scale: 1.1}}
                  onClick={() => {
                    router.push('/multiplayer/' + roomCode.toUpperCase())
                  }}
                >
                  JOIN
                </motion.div>
              </div>
            </div>
            <p className="text-[50px]">OR</p>
            <motion.div 
              className="flex rounded-lg h-[75px] w-[300px] items-center justify-center border-white border-8 bg-[#54A7F3] drop-shadow-xl text-white text-[30px]"
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.9}}
              onClick={() => {
                // send a request to the socket server to make a room
                socket.emit("requestRoom")
                setWaiting(true);
              }}
            >
              CREATE A ROOM
            </motion.div>
          </div>}
        </div>
      </SpringModal>

      {/* Logo */}
      <div>
        <Image alt="logo" src="/logo.png" width={1048.51} height={203} className="drop-shadow-lg"/>
      </div>
      {/* Buttons */}
      <div className="flex md:flex-row flex-col md:space-x-10 md:space-y-0 space-y-5">
        <Link href="/singleplayer">
          <HomeButton name="SINGLE PLAYER">
            <BsPersonFill className="text-white text-[90px]"/>
          </HomeButton>
        </Link>
        {isConnected && <div onClick={() => {setOpen(true)}}>
          <HomeButton name="MULTIPLAYER">
            <BsPeopleFill className="text-white text-[90px]"/>
          </HomeButton>
        </div>}
        {/* <HomeButton name="DAILY CHALLENGE" link="/singleplayer">
          <BsFillPuzzleFill className="text-white text-[90px]"/>
        </HomeButton> */}
      </div>
      <div>
        <p className="text-white">Ping: {latency} ms</p>
      </div>
    </div>
  )
}
