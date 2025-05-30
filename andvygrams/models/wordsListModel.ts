import { Schema, model, models, Types } from "mongoose"

const modelSchema = new Schema({
    description: {
        type: String,
        required: true,
        unique: true
    },
    words: [{type: String}]
}, {collection: 'anvygrams-collection'});

const WordsList = models.WordsList || model("WordsList", modelSchema);

export default WordsList;