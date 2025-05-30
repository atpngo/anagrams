'use client'
import { useEffect, useState } from 'react'
import { socket } from '../../components/Socket'
import { ColorRing, MutatingDots } from 'react-loader-spinner';
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTimer } from "@/app/hooks/useTimer";
import Container from '@/app/components/Container';
import { useSpring, animated } from "react-spring"; 
import ShuffleIcon from '@mui/icons-material/Shuffle';
import EnterButton from "@/app/components/EnterButton";
import SlotTile from '@/app/components/SlotTile';
import LetterTile from '@/app/components/LetterTile';
import { useKeyDown } from "@/app/hooks/useKeyDown";
import { useKeyUp } from "@/app/hooks/useKeyUp";
import Toast from '@/app/components/Toast';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineExclamationCircle } from 'react-icons/ai';
import SpringModal from '@/app/components/SpringModal';

type AnimatedNumberProps = {
    current: number,
    next: number
}

const AnimatedNumber = ({ current, next }: AnimatedNumberProps) => {
    const { number } = useSpring({
        from: { number: current },
        number: next,
        delay: 200,
        config: { mass: 1, tension: 80, friction: 20 }
    })
    return <animated.p>{number.to((next) => next.toFixed(0))}</animated.p>
}

function shuffleArray(array: string[]) {
    let a = [...array];
    return a.sort(() => Math.random() - 0.5);
}

interface PointType {
    [key: number]: number
}

const REWARDED_POINTS: PointType = {
    3: 100,
    4: 400,
    5: 800,
    6: 1400
}

export default function RoomPage()
{
    const [roomID, setRoomID] = useState('')
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [events, setEvents] = useState<any>([]);
    const [joinedRoom, setJoinedRoom] = useState(false)
    const [waiting, setWaiting] = useState(true)
    const [numPlayers, setNumPlayers] = useState(0);
    const [opponentReady, setOpponentReady] = useState(false);
    const [ready, setReady] = useState(false)
    const [latency, setLatency] = useState(0);
    const router = useRouter();
    const [waitingForAcknowledgement, setWaitingForAcknowledgement] = useState(false)
    const [waitingForGameData, setWaitingForGameData] = useState(true)
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [opponentWaiting, setOpponentWaiting] = useState(false);
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);

    const [letters, setLetters] = useState(["", "", "", "", "", ""])
    const [constLetters, setConstLetters] = useState(["", "", "", "", "", ""])
    const [answers, setAnswers] = useState(Object)

    const [showCopied, setShowCopied] = useState(false);

    const [enterButtonPressed, setEnterButtonPressed] = useState(false);
    const [usedLetters, setUsedLetters] = useState<string[]>([]);
    const [solvedWords, setSolvedWords] = useState<string[]>([]);
    const [prevPoints, setPrevPoints] = useState(0);
    const [points, setPoints] = useState(0);
    const [words, setWords] = useState(0);
    const [states, setState] = useState([false, false, false, false, false, false]);
    const [game, setGame] = useState(false);
    const [open, setOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showCorrect, setShowCorrect] = useState(false);
    const [showAlreadyUsed, setShowAlreadyUsed] = useState(false);
    const [latestWord, setLatestWord] = useState("");
    const [opponentPoints, setOpponentPoints] = useState(0);
    const [opponentPrevPoints, setOpponentPrevPoints] = useState(0);
    const [opponentWords, setOpponentWords] = useState<any[]>([]);

    const shuffle = () => {
        if (usedLetters.length === 0) // check if any vals being used
        {
            let shuffled = shuffleArray(letters)
            setLetters(shuffled);
            setConstLetters(shuffled);
        }
    }
    const submitGuess = () => 
    {
        if (usedLetters.length > 2)
        {
            let options = answers[usedLetters.length];
            let word = usedLetters.join("");
            // TODO: error toast if you already solved this word?
            
            if (options.includes(word) && !solvedWords.includes(word))
            {
                setLatestWord(word);
                setPoints((prev) => {
                    setPrevPoints(prev);
                    return prev + REWARDED_POINTS[usedLetters.length];
                })
                setWords((prev) => {
                    return prev + 1
                })
                setSolvedWords((prev) => {
                    let tmp = [...prev];
                    tmp.push(word)
                    return tmp;
                })

                setShowCorrect(true);
                // SEND MESSAGE TO SERVER
                socket.emit("scoreUpdate", points + REWARDED_POINTS[usedLetters.length], [...solvedWords, word])
            } 
            else 
            {
                if (solvedWords.includes(word)) {
                    setShowAlreadyUsed(true);
                } else {
                    setShowError(true);
                }
            }

            // reset words
            setUsedLetters([]);
            setLetters(constLetters);
        }
    }

    const activateLetter = (key: string, idx: number) => {
        setUsedLetters((prev) => {
            prev.push(letters[idx]); 
            return prev;
        });
        // mark as used
        setLetters((prev) => {
            let newState = [...prev];
            newState[idx] = "";
            return newState;
        })

        setState((prev) => {
            let newState = [...prev];
            newState[letters.indexOf(key)] = true;
            return newState;
        });
    }

    const removeLastLetterFromBoard = () => {
        if (usedLetters.length > 0)
        {
            let index = usedLetters.length-1;
            // get last letter
            removeFromBoardAtIndex(index);
        }
    }


    const removeFromBoardAtIndex = (index: number) => {
        let removed = usedLetters[index];
        // pop it
        setUsedLetters((prev) => {
            let newState = [...prev];
            newState.splice(index, 1)
            return newState;
        });

        let firstIndex = constLetters.indexOf(removed);
        // resolve repeat letters
        for (let i=0; i<letters.length; i++)
        {
            if (letters[i] === "" && constLetters[i] === removed)
            {
                firstIndex = i;
            }
        }
        // add back to options
        setLetters((prev) => {
            let newState = [...prev];
            newState[firstIndex] = removed;
            return newState;
        })
        // no longer being pressed
        setState((prev) => {
            let newState = [...prev];
            newState[firstIndex] = false;
            return newState;
        })
    }

    useKeyDown((_key) => {
        if (game)
        {
            let key = _key.toUpperCase();
            if (letters.includes(key))
            {
                // first index of letter
                const firstIndex = letters.indexOf(key);
                // push first unused letter -> used
                activateLetter(key, firstIndex);

            }
            if (key === "ENTER")
            {
                setEnterButtonPressed(true);
            }

            if (key === "BACKSPACE" && usedLetters.length > 0)
            {
                removeLastLetterFromBoard();
            }

            if (key === " ") {
                shuffle();
            }
        }
        
    })

    useKeyUp((_key) => {
        if (game)
        {
            let key = _key.toUpperCase();
            if (letters.includes(key))
            {
                setState((prev) => {
                    let newState = [...prev];
                    newState[letters.indexOf(key)] = false;
                    return newState;
                });
            }
            if (key === "ENTER")
            {
                setEnterButtonPressed(false);
                submitGuess();
            }
        }

    })


    const {seconds, start, stop} = useTimer((stop: () => void) => {
        setGame(false);
        stop();
        setOpen(true);
    }, 60) 
    // TODO: also this should be a server-side thing...

    // 3, 2, 1 Countdown timer
    const {seconds: countdownSeconds, start: startCountdown, stop: stopCountdown} = useTimer((stop: () => void) => {
        setIsCountingDown(false);
        setGame(true);
        stopCountdown();
        start();
    }, 3);


    useEffect(() => {
        let url = window.location.href.split("/");
        let room_id = url[url.length-1];
        setRoomID(room_id)
        // Request to join and validate room
        socket.emit("requestToJoin", room_id)
        // TWO CASES:
        // 1) you made this game by hitting the create room button
        // 2) you joined by entering code/visiting link
        // We need to "request to join the room" and check if the room is full
        // If we can join, then we need to add case 2 socket to the room on the server side
        // If we can't display an error and redirect to home screen


        // Future todo: perhaps display a spectator mode?
        // Future todo: account creation + stats

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

        function onResponseRequestToJoin (res: any)
        {
            setJoinedRoom(res)
            setWaiting(false);
        }

        function onPlayerReadyResponse()
        {
            setReady(true)
            setWaitingForAcknowledgement(false)
        }

        function onOpponentReady()
        {
            setOpponentReady(true)
        }

        function onGameReady()
        {
            setNumPlayers(2);
        }

        function onDataReady(res : any)
        {
            console.log(res);
            setWaitingForGameData(false)
            setLetters(res[0])
            setConstLetters(res[0])
            setAnswers(res[1])

            // singleplayer's initialization
            setOpen(false);
            setEnterButtonPressed(false);
            setAnswers(Object);
            setUsedLetters([]);
            setSolvedWords([]);
            setPrevPoints(0);
            setPoints(0);
            setWords(0);
            setState([false, false, false, false, false, false]);
            setLatestWord("");
            setOpponentPoints(0)
            setOpponentPrevPoints(0)
            setOpponentWords([]);

            // 
            setOpponentWaiting(false);
            setWaitingForOpponent(false);
            
            // start timer and game
            setIsCountingDown(true);
            startCountdown();
            // setGame(true);
            // start();
        }

        function onScoreboardUpdate(res: any)
        {
            setOpponentPrevPoints(opponentPrevPoints)
            setOpponentPoints(res[0]["opponent"])
            setOpponentWords(res[1]["opponent"])
        }

        function onOpponentLeft()
        {
            setNumPlayers(1)
            setOpponentReady(false);
            setReady(false);
            // reset game status
            setOpponentPoints(0);
            setOpponentWords([]);
            stop();
            stopCountdown();
            setWaitingForGameData(true);
        }

        function onOpponentWantsToPlayAgain()
        {
            setOpponentWaiting(true);
        }

        function onResetAndGetReady()
        {
            // Players want to play again, reset the ENTIRE LOBBY
            setWaitingForGameData(true);
            // reset timers
            stop();
            stopCountdown();
        }

        function onPing()
        {
            socket.emit("pong");
        }

        function onLatency(serverLatency: number)
        {
            setLatency(serverLatency);   
        }


        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        socket.on('someEvent', onEvent)
        socket.on("responseRequestToJoin", onResponseRequestToJoin)
        socket.on('playerReadyResponse', onPlayerReadyResponse)
        socket.on('opponentReady', onOpponentReady)
        socket.on('gameReady', onGameReady)
        socket.on('dataReady', onDataReady)
        socket.on('scoreboardUpdate', onScoreboardUpdate)
        socket.on('opponentLeft', onOpponentLeft)
        socket.on('opponentWantsToPlayAgain', onOpponentWantsToPlayAgain)
        socket.on('resetAndGetReady', onResetAndGetReady)
        socket.on('ping', onPing)
        socket.on('latency', onLatency)

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            socket.off('someEvent', onEvent)
            socket.off("responseRequestToJoin", onResponseRequestToJoin)
            socket.off('playerReadyResponse', onPlayerReadyResponse)
            socket.off('opponentReady', onOpponentReady)
            socket.off('gameReady', onGameReady)
            socket.off('dataReady', onDataReady)
            socket.off('scoreboardUpdate', onScoreboardUpdate)
            socket.off('opponentLeft', onOpponentLeft)
            socket.off('opponentWantsToPlayAgain', onOpponentWantsToPlayAgain)
            socket.off('resetAndGetReady', onResetAndGetReady)
            socket.off('ping', onPing)
            socket.off('latency', onLatency)


        }




    }, [])

    if (waiting)
    {
        return (
            <div className='flex w-full h-full justify-center items-center z-[1000]'>
                <MutatingDots 
                    height="100"
                    width="100"
                    color="#fff"
                    secondaryColor= '#fff'
                    radius='12.5'
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                />
            </div>
        )
    }

    // if everyone is ready, start the game!!!!!!!!!!!
    if (ready && opponentReady)
    {
        if (waitingForGameData)
        {
            return (
                <div className='w-full h-full justify-evenly flex flex-col items-center z-[1000] text-center'>
                    <p className='text-white text-[50px]'>WAITING FOR GAME DATA...</p>
                    <ColorRing
                        visible={true}
                        height="200"
                        width="200"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperClass="blocks-wrapper"
                        colors={['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']}
                    />
                </div>
            )
        }

        if (isCountingDown)
        {
            return (
                <div className="w-full h-full justify-evenly flex flex-col items-center z-[1000] text-center">
                    
                    <p className="text-white lg:text-[300px] text-[200px]">{countdownSeconds != 0 ? countdownSeconds : "GO!"}</p>
                </div>
            )
        }

        // return the game from single player!!!!!!!!
        return (
            <div className='flex z-[1000] flex-col p-4 h-screen items-center justify-evenly' tabIndex={0}>

                {/* SPRING MODAL */}
                <SpringModal open={open} handleClose={(event, reason) => {
                    if ((reason !== "backdropClick") && (reason !== "escapeKeyDown"))
                    {
                        setOpen(false)
                    }
                }}>
                    <div className="w-[90vw] h-[600px] max-w-[450px] text-center bg-alt-pink rounded-lg py-4 border-white border-4 text-white space-y-2 focus:border-transparent focus:ring-0">
                        <p className="text-4xl">{(points > opponentPoints) ? "YOU WON!" : (points == opponentPoints) ? "TIE!" : "YOU LOST!"}</p>
                        <p className="text-2xl">YOUR SCORE: {points}</p>
                        <p className="text-2xl">OPPONENT SCORE: {opponentPoints}</p>
                        <div className='flex h-[65%] justify-between'>
                            <div className="flex flex-col overflow-auto w-1/2 px-8 no-scrollbar">
                                <p className='text-xl'>YOUR WORDS</p>
                                {solvedWords.sort((a,b) => {
                                    return b.length-a.length || a.localeCompare(b)
                                }).map((word, idx) => {
                                    if (idx < 10) // limit 10
                                    {
                                        return (
                                            <div key={idx} className="flex flex-row justify-between w-full text-xl">
                                                <p>{word}</p>
                                                <p>{REWARDED_POINTS[word.length]}</p>
                                            </div>
                                        )
                                    }
                                    
                                })}
                            </div>
                            <div className='bg-white w-[1px] rounded-xl'></div>
                            <div className="flex flex-col overflow-auto w-1/2 px-8 no-scrollbar">
                                <p className='text-xl'>OPPONENT</p>
                                {/* fetch opponent words */}
                                {opponentWords.sort((a,b) => {
                                    return b.length-a.length || a.localeCompare(b)
                                }).map((word, idx) => {
                                    if (idx < 10)
                                    {
                                        return (
                                            <div key={idx} className="flex flex-row justify-between w-full text-xl">
                                                <p>{word}</p>
                                                <p>{REWARDED_POINTS[word.length]}</p>
                                            </div>
                                        )
                                    }
                                    
                                })}
                            </div>
                        </div>
                        <div className="flex w-full justify-evenly">
                            <motion.button
                                className="text-xl border-4 border-white p-2 px-4 rounded-lg "
                                // className="text-xl border-4 border-white p-2 px-4 bg-[#49A61E] rounded-lg "
                                whileHover={{scale: 1.2}}
                                whileTap={{scale: 1.1}}
                                style={{
                                'background': opponentWaiting ? "#54A7F3" : (waitingForOpponent ? "#8a8a8a" : "#49A61E")
                                }}
                                disabled={waitingForOpponent}
                                onClick={() => {
                                    socket.emit("letsPlayAgain", roomID)
                                    setWaitingForOpponent(true);
                                }}
                            >
                                {opponentWaiting ? "CLICK TO PLAY AGAIN!" : (waitingForOpponent ? "WAITING..." : "ASK TO PLAY AGAIN?")}
                            </motion.button>
                            <motion.button
                                className="text-2xl border-4 border-white p-2 px-4 bg-[#F03F4A] rounded-lg"
                                whileHover={{scale: 1.2}}
                                whileTap={{scale: 1.1}}
                                onClick={() => {
                                    // disconnect from room
                                    socket.emit("leaveRoom", roomID)
                                    router.push("/")
                                }}
                            >
                                LEAVE
                            </motion.button>
                        </div>
                    </div>
                </SpringModal>
                {/* TOASTS */}
                <Toast show={showError} setShow={setShowError}>
                    <div className="bg-red-500 flex m-0 p-3 border-4 border-white rounded-lg text-center justify-center items-center gap-2">
                        <AiOutlineCloseCircle size={30} className='text-white'/>
                        <p className='text-xl text-white m-0 p-0'>Not a word</p>
                    </div>
                </Toast>
                <Toast show={showAlreadyUsed} setShow={setShowAlreadyUsed}>
                    <div className="bg-red-500 flex m-0 p-3 border-4 border-white rounded-lg text-center justify-center items-center gap-2">
                        <AiOutlineExclamationCircle size={30} className='text-white'/>
                        <p className='text-xl text-white m-0 p-0'>Already found!</p>
                    </div>
                </Toast>
                <Toast show={showCorrect} setShow={setShowCorrect}>
                        <div className="bg-green-500 flex m-0 p-3 border-4 border-white rounded-lg text-center justify-center items-center gap-2">
                            <AiOutlineCheckCircle size={30} className='text-white'/>
                            <p className='text-xl text-white m-0 p-0'>{latestWord}</p>
                        </div>
                </Toast>
                

                <div>
                    <Image alt="logo" src="/logo.png" width={1000} height={20} className="drop-shadow-lg w-[300px] lg:w-[800px]"/>
                </div>
                {/* SCOREBOARD */}
                <div className='w-full bg-alt-pink border-4 rounded-xl border-white flex items-center justify-between'>
                    <div
                        className="bg-[#2CBDFC] p-2 rounded-l-lg border-0 border-[#2CBDFC]"
                        style={{
                            'width': `${Math.min(points*100/(points+opponentPoints), 100)}%`,
                            'transition': '0.7s ease'
                        }}
                    >
                        <p className='text-white text-xl'>YOU</p>
                    </div>

                </div>

                {/* actual game */}
                <div className='flex flex-col space-y-3 items-center'>
                    <div className="space-y-4 md:flex md:flex-row md:h-max-[300px] md:space-y-0 md:space-x-4">
                        {/* TIMER */}
                        <Container>
                            <p className="-my-4 text-[80px]">0{Math.floor(seconds/60)}:{seconds < 10 && 0}{seconds%60}{(seconds%60 === 0 && seconds > 0) && 0}</p>
                        </Container>
                        {/* SCORE */}
                        <Container>
                            <div className="flex flex-col text-center my-2 items-center">
                                <div className="text-[40px] flex flex-row space-x-2">
                                    <p>SCORE:</p>
                                    <AnimatedNumber current={prevPoints} next={points}/>
                                </div>
                                <p className="text-[20px]">WORDS: {words}</p>
                                <div className="text-[20px] flex flex-row space-x-2">
                                    <p>OPPONENT SCORE:</p>
                                    <AnimatedNumber current={opponentPrevPoints} next={opponentPoints}/>
                                </div>
                                <div><p>{latency.toFixed(2)} ms</p></div>
                            </div>
                        </Container>
                    </div>
                    <div className="flex flex-col justify-center items-center space-y-4">
                        {/* SHUFFLE */}
                        <motion.div whileHover={{scale: 1.2}} whileTap={{scale: 1.1}} onClick={() => {
                            shuffle();
                            
                        }}>
                            <ShuffleIcon className="text-white" fontSize="large"/>
                        </motion.div>
                        {/* ENTER */}
                        <EnterButton isPressed={enterButtonPressed} onClick={() => {submitGuess()}}>
                            <p className="text-[30px] px-4">ENTER</p>
                        </EnterButton>
                    </div>
                </div>
                {/* GAME */}
                <div className="flex flex-col space-y-2">
                    {/* SLOTS */}
                    <div className="flex space-x-2">
                        {usedLetters.map((letter, idx) => {
                            return (
                                <SlotTile letter={letter} key={idx} removeFunction={() => {removeFromBoardAtIndex(idx)}}/>
                            )
                        })}
                        {Array(letters.length-usedLetters.length).fill("").map((letter, idx) => {
                            return <SlotTile letter={letter} key={idx} removeFunction={() => {}}/>
                        })}
                    </div>
                    {/* LETTERS */}
                    <div className="flex space-x-2">
                        {letters.map((letter, idx) => {
                            return (
                                <LetterTile key={idx} isPressed={states[idx]} letter={letter} onActivate={() => {if (game) activateLetter(letter, idx)}}/>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full h-full justify-center items-center z-[1000]">
            <div className='z-[1001] lg:w-[700px] w-[350px] h-[500px] border-white border-4 rounded-xl bg-alt-pink'>
                {joinedRoom ? <div className='flex flex-col items-center justify-center w-full h-full'>
                    {(numPlayers < 2) ? 
                    // Waiting for player 2
                    <div className="flex flex-col justify-evenly items-center h-full w-full text-center">
                        <p className='text-white lg:text-[50px] text-[35px]'>WAITING FOR OPPONENT...</p>
                        <ColorRing
                            visible={true}
                            height="200"
                            width="200"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']}
                        />
                        <div className='flex lg:flex-row flex-col gap-4'>
                            <p className='text-white lg:text-[50px] text-[30px]'>ROOM CODE: {roomID}</p>
                            <motion.div 
                                className='border-white border-4 rounded-lg text-white justify-center items-center flex lg:text-[40px] text-[30px] px-4'
                                style={{
                                    'background': showCopied ? "#AE0090" : "#49A61E"
                                }}
                                whileTap={{scale: 0.9}}
                                whileHover={{scale: 1.1}}
                                // TODO: display toast?
                                onClick={() => {
                                    setShowCopied(true);
                                    navigator.clipboard.writeText(window.location.href)
                                }}
                            >
                                {showCopied ? "COPIED!" : "COPY"}
                            </motion.div>
                        </div>
                    </div> : 
                    // Second player joined
                    <div className="flex flex-col justify-evenly items-center h-full w-full text-center">
                        <p className='text-white lg:text-[50px] text-[30px]'>OPPONENT FOUND!</p>
                        <div className='flex flex-col w-full gap-8'>
                            <div className='flex w-full justify-between text-white items-center lg:px-[100px] px-10'>
                                <p className='lg:text-[40px] text-[25px]'>OPPONENT</p>
                                <div className={`border-4 rounded-lg ${opponentReady ? "bg-[#49A61E]" : "bg-[#969696]"} lg:text-[40px] text-[20px] px-4`}>
                                    {opponentReady ? "READY" : "WAITING..."}
                                </div>
                            </div>
                            <div className='flex w-full justify-between text-white items-center lg:px-[100px] px-10'>
                                <p className='lg:text-[40px] text-[25px]'>YOU</p>
                                <motion.div 
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    className={`border-4 rounded-lg ${ready ? "bg-[#49A61E]" : "bg-[#54A7F3]"} lg:text-[40px] text-[20px] px-4`}
                                    onClick={() => {
                                        // send message to server that you're ready
                                        if (!ready && !waitingForAcknowledgement)
                                        {
                                            socket.emit("playerReady", roomID);
                                            setWaitingForAcknowledgement(true)
                                        }
                                    }}
                                >
                                    {ready ? "READY" : (waitingForAcknowledgement ? "WAITING" : "READY UP!")}
                                </motion.div>
                            </div>
                        </div>
                        <div className='flex lg:flex-row flex-col gap-4'>
                            <p className='text-white lg:text-[40px] text-[35px]'>ROOM CODE: {roomID}</p>
                        </div>
                    </div>}
                </div> : 
                <div className='flex flex-col gap-2 text-white lg:text-[50px] text-[40px] p-10 justify-evenly items-center h-full w-full text-center'>
                    <p>ROOM CODE IS INVALID OR ROOM IS ALREADY FULL!</p>
                    <motion.div 
                        className="border-4 border-white bg-btn-pink p-3 rounded-xl lg:text-[30px] text-[20px]"
                        whileHover={{scale: 1.2}}
                        whileTap={{scale: 1.1}}
                        onClick={() => {router.push('/')}}
                    >
                        RETURN TO MAIN MENU
                    </motion.div>
                </div>}
            </div>
        </div>
    )
}