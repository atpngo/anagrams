import json
import os
import random
import time
import psutil
from collections import Counter, defaultdict
import itertools


def profile(func):
    """Decorator to print latency and memory delta of each call."""

    def wrapper(self, *args, **kwargs):
        proc = psutil.Process(os.getpid())
        mem_before = proc.memory_info().rss
        t0 = time.perf_counter()
        result = func(self, *args, **kwargs)
        dt = (time.perf_counter() - t0) * 1e3  # ms
        mem_after = proc.memory_info().rss
        print(
            f"{func.__name__} took {dt:.3f}ms, ΔRSS={(mem_after-mem_before)/1024:.1f}KiB"
        )
        return result

    return wrapper


class Database:
    # @profile
    def __init__(self, datafile):
        self.datafile = os.path.join(os.path.dirname(__file__), *datafile.split("/"))
        if not os.path.isfile(self.datafile):
            raise OSError(2, f"No such file: {self.datafile}")

        # load once
        with open(self.datafile) as fin:
            raw_words = json.load(fin)["words"]  # e.g. ["ant","toe",...]

        # index by length
        self.words_by_length = defaultdict(lambda: [])
        for w in raw_words:
            self.words_by_length[len(w)].append(w)

        # 1) exact anagrams
        self.anagrams_map = defaultdict(set)
        for w in raw_words:
            key = self.format(w)
            self.anagrams_map[key].add(w)

        # 2) sub-anagrams by subset generation
        # only lengths 3..6 (since raw_words are 3–7 chars)
        for key in list(self.anagrams_map.keys()):
            L = len(key)
            for size in range(3, L):
                # combinations respects duplicates in `key`
                for comb in itertools.combinations(key, size):
                    subkey = "".join(comb)
                    if subkey in self.anagrams_map:
                        self.anagrams_map[key].update(self.anagrams_map[subkey])

    # @profile
    def get_random_word(self, num_letters):
        """Return one random word of exactly `num_letters`."""
        bucket = self.words_by_length.get(num_letters)
        if not bucket:
            return None
        return random.choice(bucket)

    # @profile
    def get_anagrams(self, letters):
        """
        Return all exact anagrams of `letters`, plus sub-anagrams:
        any word whose letter-count is <= letter-count of `letters`.
        """
        res = {3:[], 4:[], 5:[], 6:[], 7:[]}
        for word in self.anagrams_map[self.format(letters)]:
            res[len(word)].append(word)
        return res

    def format(self, word):
        return "".join(sorted(word.upper()))


if __name__ == "__main__":
    db = Database("ALL_WORDS.json")
    # quick sanity check & profiling
    # print(db.get_random_word(6))
    # print(db.get_anagrams("TOENAIL"))
