import { Schema, model, models, Types } from "mongoose"

const modelSchema = new Schema({
    description: {
        type: String,
        required: true,
        unique: true
    },
    words: {
        type: Object
    }
}, {collection: 'anvygrams-collection'});

const Anagram = models.Anagram || model("Anagram", modelSchema);

export default Anagram;