"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  X,
  Loader2,
  MessageSquare,
  User,
  CheckCheck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { getSocket } from "@/lib/socket";

interface IMessageItem {
  _id?: string;
  senderId: string | { _id: string; name?: string };
  text: string;
  time: string;
  roomId?: string;
  createdAt?: string;
}

interface DeliveryChatProps {
  orderId: string;
  userId: string;
  deliveryBoyId: string;
  currentUserId: string;
  recipientName?: string;
  onClose?: () => void;
}

export default function DeliveryChat({
  orderId,
  userId,
  deliveryBoyId,
  currentUserId,
  recipientName = "Chat Partner",
  onClose,
}: DeliveryChatProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "On my way! 🚚",
    "Reached location 📍",
    "Please call when outside 📞",
    "Please wait a moment ⏳",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize or fetch room and messages
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        setLoading(true);
        // Create or get chat room
        const roomRes = await axios.post("/api/chat/create", {
          orderId,
          userId,
          deliveryBoyId,
        });

        if (isMounted && roomRes.data?.success && roomRes.data?.room?._id) {
          const activeRoomId = String(roomRes.data.room._id);
          setRoomId(activeRoomId);

          // Connect socket & join room
          const socket = getSocket();
          socket?.emit("join-room", activeRoomId);

          // Fetch message history
          const msgRes = await axios.post("/api/chat/messages", {
            roomId: activeRoomId,
          });

          if (isMounted && msgRes.data?.success && Array.isArray(msgRes.data.messages)) {
            setMessages(msgRes.data.messages);
          }
        }
      } catch {
        // Chat init error
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [orderId, userId, deliveryBoyId]);

  // Real-time socket message listener
  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();

    const handleReceiveMessage = (msgData: IMessageItem) => {
      const incomingRoom = msgData.roomId ? String(msgData.roomId) : null;
      if (incomingRoom && incomingRoom !== String(roomId)) return;

      const senderIdStr =
        typeof msgData.senderId === "object"
          ? String(msgData.senderId._id)
          : String(msgData.senderId);

      // Do NOT re-add if sent by current user (since optimistic update already added it)
      if (senderIdStr === String(currentUserId)) return;

      setMessages((prev) => {
        if (msgData._id && prev.some((m) => m._id === msgData._id)) return prev;
        if (prev.some((m) => m.text === msgData.text && m.time === msgData.time)) return prev;
        return [...prev, msgData];
      });
    };

    socket?.on("receive-message", handleReceiveMessage);

    return () => {
      socket?.off("receive-message", handleReceiveMessage);
    };
  }, [roomId, currentUserId]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !roomId || sending) return;

    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsgObj: IMessageItem = {
      senderId: currentUserId,
      text,
      time: formattedTime,
      roomId,
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMsgObj]);
    if (!textToSend) setInputText("");
    setSending(true);

    try {
      // 1. Emit via socket instantly
      const socket = getSocket();
      socket?.emit("send-message", newMsgObj);

      // 2. Persist to MongoDB
      await axios.post("/api/chat/save", {
        senderId: currentUserId,
        text,
        roomId,
        time: formattedTime,
      });
    } catch {
      // Failed to save message
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col w-full h-130 max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
    >
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-xs border border-white/20">
            <User size={20} />
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>{recipientName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-emerald-200 font-semibold">
              Order #{orderId.slice(-6).toUpperCase()} • Live Support Chat
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-3">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={28} className="animate-spin text-emerald-700" />
            <p className="text-xs font-bold">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">
              No Messages Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Send a message or quick reply below to coordinate order delivery!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderIdStr =
              typeof msg.senderId === "object"
                ? msg.senderId._id
                : msg.senderId;
            const isMe = String(senderIdStr) === String(currentUserId);

            return (
              <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                    isMe
                      ? "bg-linear-to-r from-emerald-700 to-teal-700 text-white rounded-br-2xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-2xs"
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-bold text-emerald-700">
                      {recipientName}
                    </p>
                  )}
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] ${
                      isMe ? "text-emerald-200" : "text-slate-400"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck size={11} />}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Pills */}
      <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        <Sparkles size={13} className="text-emerald-700 shrink-0 ml-1" />
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(reply)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold rounded-full border border-slate-200 shadow-2xs whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || sending || loading}
          className="w-10 h-10 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </motion.div>
  );
}
