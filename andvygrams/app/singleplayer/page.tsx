'use client'
import Image from "next/image";
import Container from "../components/Container";
import LetterTile from "../components/LetterTile";
import SlotTile from "../components/SlotTile";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import axios from 'axios';
import { useEffect, useState } from "react";
import EnterButton from "../components/EnterButton";
import { motion } from "framer-motion"
import { useTimer } from "../hooks/useTimer";
import { useKeyDown } from "../hooks/useKeyDown";
import { useKeyUp } from "../hooks/useKeyUp";
import { useSpring, animated } from "react-spring"; 
import SpringModal from "../components/SpringModal";
import Toast from "../components/Toast";
import { AiOutlineCheckCircle } from "react-icons/ai";
import Link from "next/link";
import Loading from "../components/Loading";

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

export default function Page()
{
   
    const [enterButtonPressed, setEnterButtonPressed] = useState(false)
    const [loading, setLoading] = useState(true);
    const [letters, setLetters] = useState(["", "", "", "", "", ""])
    const [constLetters, setConstLetters] = useState(["", "", "", "", "", ""])
    const [answers, setAnswers] = useState(Object);
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
    const [latestWord, setLatestWord] = useState("");

    const {seconds, start, stop} = useTimer((stop: () => void) => {
        setGame(false);
        stop();
        setOpen(true);
        // window.alert("ALL DONE")
    }, 60)

    const initializeGame = () => {
        setOpen(false);
        setEnterButtonPressed(false);
        setLoading(true);
        setLetters(["", "", "", "", "", ""]);
        setConstLetters(["", "", "", "", "", ""]);
        setAnswers(Object);
        setUsedLetters([]);
        setSolvedWords([]);
        setPrevPoints(0);
        setPoints(0);
        setWords(0);
        setState([false, false, false, false, false, false]);
        setGame(false);
        setLatestWord("");

        axios.post('https://words.andytpngo.org/api/words/random', {'length': 6}).then(
            res => {
                let word = res.data.word;
                const shuffled = shuffleArray(Array.from(word));
                setLetters(shuffled);
                setConstLetters(shuffled);
                axios.post('https://words.andytpngo.org/api/anagrams/letters', {"letters": word}).then(
                    res_2 => {
                        setAnswers(res_2.data.words);
                        console.log(res_2.data.words)
                        setLoading(false);
                        setGame(true);
                        start();
                    }
                )
                
            }
        )
    }


    const submitGuess = () => 
    {
        if (usedLetters.length > 2)
        {
            console.log("USED LETTERS", usedLetters);
            let options = answers[usedLetters.length];
            let word = usedLetters.join("");
            // TODO: error toast if you already solved this word
            
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
            }
            else 
            {
                setShowError(true);
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

    const removeLastLetterFromBoard = () => {
        if (usedLetters.length > 0)
        {
            let index = usedLetters.length-1;
            // get last letter
            removeFromBoardAtIndex(index);
        }
    }

    useKeyDown((_key) => {
        if (game)
        {
            let key = _key.toUpperCase();
            console.log(key)
            if (letters.includes(key))
            {
                // first index of letter
                const firstIndex = letters.indexOf(key);
                // push first unused letter -> used
                activateLetter(key, firstIndex);

            }
            if (key === "ENTER")
            {
                console.log(solvedWords)
                setEnterButtonPressed(true);
            }

            if (key === "BACKSPACE" && usedLetters.length > 0)
            {
                removeLastLetterFromBoard();
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

    useEffect(() => {
        initializeGame()
    }, [])

    if (loading)
    {
        return (
            <Loading/>
        )
    }

    return (
        <div className="flex z-10 flex-col p-4 h-screen items-center justify-evenly" tabIndex={0}>
            <SpringModal open={open} handleClose={(event, reason) => {
                if ((reason !== "backdropClick") && (reason !== "escapeKeyDown"))
                {
                    setOpen(false)
                }
            }}>
                <div className="w-[90vw] h-[600px] max-w-[450px] text-center bg-alt-pink rounded-lg py-4 border-white border-4 text-white space-y-2 focus:border-transparent focus:ring-0">
                    <p className="text-4xl">Solved Words</p>
                    <p className="text-2xl">Score: {points}</p>
                    <div className="flex flex-col overflow-auto h-[73%] px-4">
                        {solvedWords.sort((a,b) => {
                            return b.length-a.length || a.localeCompare(b)
                        }).map((word, idx) => {
                            return (
                                <div key={idx} className="flex flex-row justify-between w-full text-xl">
                                    <p>{word}</p>
                                    <p>{REWARDED_POINTS[word.length]}</p>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex w-full justify-evenly">
                        <motion.button
                            className="text-2xl border-4 border-white p-2 px-4 bg-green-500 rounded-lg "
                            whileHover={{scale: 1.2}}
                            whileTap={{scale: 1.1}}
                            onClick={initializeGame}
                        >
                            Play Again
                        </motion.button>
                        <Link href="/">
                            <motion.button
                                className="text-2xl border-4 border-white p-2 px-4 bg-btn-pink rounded-lg "
                                whileHover={{scale: 1.2}}
                                whileTap={{scale: 1.1}}
                            >
                                Home Screen
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </SpringModal>

            {/* Toasts */}
            <Toast show={showError} setShow={setShowError}>
                    <div className="bg-red-500 flex m-0 p-3 border-4 border-white rounded-lg text-center justify-center items-center gap-2">
                        <AiOutlineCheckCircle size={30} className='text-white'/>
                        <p className='text-xl text-white m-0 p-0'>Incorrect!</p>
                    </div>
            </Toast>
            <Toast show={showCorrect} setShow={setShowCorrect}>
                    <div className="bg-green-500 flex m-0 p-3 border-4 border-white rounded-lg text-center justify-center items-center gap-2">
                        <AiOutlineCheckCircle size={30} className='text-white'/>
                        <p className='text-xl text-white m-0 p-0'>{latestWord}</p>
                    </div>
            </Toast>
            
            {/* LOGO */}
            <div>
                <Image alt="logo" src="/logo.png" width={1000} height={20} className="drop-shadow-lg"/>
            </div>
            {/* ETC */}
            <div className="flex flex-col space-y-3 items-center">
                <div className="space-y-4 md:flex md:flex-row md:h-max-[300px] md:space-y-0 md:space-x-4">
                    {/* TIMER */}
                    <Container>
                        <p className="-my-4 text-[80px]">0{Math.floor(seconds/60)}:{seconds < 10 && 0}{seconds%60}{(seconds%60 === 0 && seconds > 0) && 0}</p>
                    </Container>
                    {/* SCORE */}
                    <Container>
                        <div className="flex flex-col text-center my-2">
                            <div className="text-[40px] flex flex-row space-x-2">
                                <p>SCORE:</p>
                                <AnimatedNumber current={prevPoints} next={points}/>
                            </div>
                            <p className="text-[20px]">WORDS: {words}</p>
                        </div>
                    </Container>
                </div>
                <div className="flex flex-col justify-center items-center space-y-4">
                    {/* SHUFFLE */}
                    <motion.div whileHover={{scale: 1.2}} whileTap={{scale: 1.1}} onClick={() => {
                        if (usedLetters.length === 0)
                        {
                            let shuffled = shuffleArray(letters)
                            setLetters(shuffled);
                            setConstLetters(shuffled);
                        }
                        
                    }}>
                        <ShuffleIcon className="text-white text-[100px]"/>
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