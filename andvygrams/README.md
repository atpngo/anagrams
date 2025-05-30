# Andvygrams - Online 1v1 Anagrams Game

## Installation
1. Install dependencies
```
npm install --force
```
2. Run
```
npm run dev
```

## Road Map:
- allow players to customize duration (default: 60s)
- allow players to customize anagram length (default: 6)
- move a lot of client-side calculations onto server
    - currently server is fetching word data from nextjs api
    - server should be setting the timer and word length
- allow for more than 2 players
- fix all the bugs lol
- plenty more things that I will probably think of while I work on the above issues


## Troubleshooting
1. Double Question Mark (??) operator
- need node mininum version v18.12.1
- https://stackoverflow.com/questions/74707066/nextjs-unexpected-token

    