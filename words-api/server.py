from fastapi import FastAPI
from pydantic import BaseModel
from database import Database

app = FastAPI()
db = Database("ALL_WORDS.json")
@app.get("/")
async def root():
    return {"message": "Hello World"}


# --- request models ---
class WordsPayload(BaseModel):
    length: int

class AnagramsPayload(BaseModel):
    letters: str


# --- endpoints ---
@app.post("/api/words/random")
async def get_words(payload: WordsPayload):
    """
    Expects JSON {"length": n}
    Return a random word with the same length
    """
    if not (3<= payload.length <= 7):
        length = 7
    else:
        length = payload.length
    return {"word": db.get_random_word(length)}


@app.post("/api/anagrams/letters")
async def get_anagrams(payload: AnagramsPayload):
    """
    Expects JSON {"letters": "word"}
    Return array of anagrams of that letter
    """
    return {"words": db.get_anagrams(payload.letters)}