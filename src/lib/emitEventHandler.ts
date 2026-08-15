import axios from "axios";

export default async function emitEventHandler(event: string, data: any, socketId?: string): Promise<void> {
  try {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    await axios.post(`${socketServerUrl}/notify`, {
      socketId,
      event,
      data,
    });
  } catch {
    // Ignored in background event emission
  }
}
