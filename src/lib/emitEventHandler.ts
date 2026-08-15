import axios from "axios";

export default async function emitEventHandler(event: string, data: any, socketId?: string): Promise<void> {
  try {
    const socketServerUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER ||
      process.env.SOCKET_SERVER_URL ||
      "http://localhost:4000";

    await axios.post(`${socketServerUrl}/notify`, {
      socketId,
      event,
      data,
    }, {
      timeout: 5000,
    });
  } catch {
    // Fail silently in production background execution
  }
}
