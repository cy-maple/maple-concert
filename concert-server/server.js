import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(cors());
const distPath = join(__dirname, "..", "concert-web", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(join(distPath, "index.html"));
});
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
// mongodb
const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log("connect db successful");
  });
const messageSchema = mongoose.Schema({
  user: {
    type: String,
    required: [true, "user must!!!"],
  },
  type: {
    type: String,
    required: [true, "type must!!!"],
  },
  text: {
    type: String,
  },
  record: {
    type: Buffer,
  },
  recordTime: {
    type: Number,
  },
  date: {
    type: String,
    required: [true, "date must!!!"],
  },
});

const roomUserList = {};
// server
io.on("connection", (socket) => {
  const user = socket.handshake.query.user;
  const room = socket.handshake.query.room;
  roomUserList[room] = roomUserList[room] || [];
  console.log(`${user} enter ${room}`);
  socket.on("disconnect", () => {
    console.log(`${user} leave ${room}`);
    roomUserList[room].splice(roomUserList[room].indexOf(user), 1);
    socket.broadcast.to(room).emit("initUserList", roomUserList[room]);
  });
  socket.join(room);
  roomUserList[room].push(user);
  socket.emit("initUserList", roomUserList[room]);
  socket.broadcast.to(room).emit("enterUser", user);
  // 添加消息
  const setMessage = (message) => {
    const newMessage = new roomMessage(message);
    newMessage
      .save()
      .then((doc) => {
        console.log(doc);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const roomMessage = mongoose.model(room, messageSchema);
  let initMessage = [];
  roomMessage.find().then((msgs) => {
    initMessage = msgs;
    socket.emit("initMessageList", initMessage);
  });
  socket.on("chat", (room, message, isStorage = true) => {
    if (isStorage) {
      setMessage(message);
    }
    io.to(room).emit("chat", message);
  });
  socket.on("offer", (user, offer) => {
    console.log(`${user}发出offer`);
    socket.broadcast.to(room).emit("offer", user, offer);
  });
  socket.on("answer", (user, answer) => {
    console.log(`${user}回复answer`);
    socket.broadcast.to(room).emit("answer", user, answer);
  });
  socket.on("candidate", (user, candidate) => {
    console.log(`${user}已就绪candidate`);
    socket.broadcast.to(room).emit("candidate", user, candidate);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
