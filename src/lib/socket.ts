import { Socket, io } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000");
    }
    return socket;
};

