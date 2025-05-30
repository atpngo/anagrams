import { NextResponse } from "next/server";
import connectMongo from "@/utils/connection"
import Anagram from "@/models/anagramModel";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const letters = searchParams.get('letters')?.toUpperCase()
    if (letters)
    {
        const formattedLetters = Array.from(letters).sort().join("")
        await connectMongo();
        const data = await Anagram.findOne({description: formattedLetters});
        return NextResponse.json(data)
    }
    return NextResponse.json({'error': '404'})
}

