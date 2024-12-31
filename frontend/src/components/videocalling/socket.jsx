import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:8080"; // Replace with your server URL
const socket = io(ENDPOINT, { transports: ["websocket"] });

export default socket;
