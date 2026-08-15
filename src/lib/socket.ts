import { Socket, io } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const socketServerUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER ||
      (typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "https://snapcart-socket.onrender.com"
        : "http://localhost:4000");

    socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
