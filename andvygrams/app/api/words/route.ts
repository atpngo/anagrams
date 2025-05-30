import { NextResponse } from "next/server";
import connectMongo from "@/utils/connection"
import WordsList from "@/models/wordsListModel";

export async function POST(request: Request) {
    const req = await request.json();
    if (req.length) {
        await connectMongo();
        const data = await WordsList.findOne({description: req.length});
        return NextResponse.json(data)
    }
    return NextResponse.json({'error': '404'})
}