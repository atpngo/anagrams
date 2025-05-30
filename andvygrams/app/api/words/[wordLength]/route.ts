import { NextResponse } from "next/server";
import connectMongo from "@/utils/connection"
import WordsList from "@/models/wordsListModel";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const length = searchParams.get('length')
    await connectMongo();
    const data = await WordsList.findOne({description: length});
    return NextResponse.json(data)
}