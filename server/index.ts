import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rateLimits = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(userId);
  if (!limit || now > limit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + 10000 });
    return false;
  }
  if (limit.count >= 20) return true;
  limit.count++;
  return false;
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user-join", ({ userId, username }: { userId: string; username: string }) => {
    socket.data.userId = userId;
    socket.data.username = username;
    console.log("User joined:", username);
    io.emit("presence-update", { userId, status: "online" });
  });

  socket.on("join-room", ({ roomId, userId }: { roomId: string; userId: string }) => {
    socket.join(roomId);
    console.log("User", userId, "joined room:", roomId);
  });

  socket.on("leave-room", ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
  });

  socket.on("send-message", (message) => {
    const userId = socket.data.userId;
    if (isRateLimited(userId)) {
      socket.emit("error", { message: "Too many messages. Please slow down." });
      return;
    }
    console.log("Message in room", message.roomId, "from", message.username);
    io.to(message.roomId).emit("message", message);
  });

  socket.on("message-deleted", ({ roomId, messageId }: { roomId: string; messageId: string }) => {
    socket.to(roomId).emit("message-deleted", { messageId });
  });

  socket.on("message-edited", ({ roomId, messageId, text }: { roomId: string; messageId: string; text: string }) => {
    socket.to(roomId).emit("message-edited", { messageId, text });
  });

  socket.on("typing-start", ({ roomId, userId, username }: { roomId: string; userId: string; username: string }) => {
    socket.to(roomId).emit("typing-start", { userId, username });
  });

  socket.on("typing-stop", ({ roomId, userId }: { roomId: string; userId: string }) => {
    socket.to(roomId).emit("typing-stop", { userId });
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    if (userId) {
      console.log("User disconnected:", userId);
      io.emit("presence-update", { userId, status: "offline" });
      rateLimits.delete(userId);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log("Socket.io server running on port", PORT);
});
