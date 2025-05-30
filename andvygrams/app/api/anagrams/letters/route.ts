import { NextResponse } from "next/server";
import connectMongo from "@/utils/connection"
import Anagram from "@/models/anagramModel";

export async function POST(request: Request) {
    const req = await request.json();
    if (req.letters)
    {
        const formattedLetters = Array.from(req.letters).sort().join("")
        await connectMongo();
        const data = await Anagram.findOne({description: formattedLetters});
        return NextResponse.json(data)
    }
    return NextResponse.json({'erorr': '404'})
}