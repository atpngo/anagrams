import { io } from "socket.io-client";

// "prod"
// export const socket = io("https://socket-server-9qm5.onrender.com", {autoConnect: false})
export const socket = io("https://socket-server.andytpngo.org", {autoConnect: false})
// export const socket = io("http://raspberrypi.local:4000", {autoConnect: false})
// "local"
// export const socket = io("http://localhost:4000", {autoConnect: false})
