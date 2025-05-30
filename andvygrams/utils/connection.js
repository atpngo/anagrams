import mongoose from "mongoose";

const { DB_URL, DB_NAME } = process.env;

const connectMongo = async () => mongoose.connect(DB_URL, {dbName: DB_NAME});

export default connectMongo;