// returns random letter
import { NextResponse } from "next/server";
import connectMongo from "@/utils/connection"
import Anagram from "@/models/anagramModel";

export async function GET(request: Request) {
    await connectMongo();
    const data = await Anagram.findOne({description: "database"});
    if (data)
    {
        const db = data["words"];
        const words = Object.keys(db);
        const randomNum = Math.floor(Math.random()*words.length);
        const randomWord = words[randomNum];
        return NextResponse.json({"word": randomWord, "answers": db[randomWord]})
    }
    return NextResponse.json({error: '404'})
}
