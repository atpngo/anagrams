import { NextResponse } from "next/server";
import connectMongo from "@/utils/connection"
import WordsList from "@/models/wordsListModel";

export async function GET(request: Request) {
    await connectMongo();
    const data = await WordsList.findOne({description: "all"});
    return NextResponse.json(data)
}