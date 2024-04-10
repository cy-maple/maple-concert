import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
class VideoSocket {
  constructor(port) {
    this.port = port;
  }
  start() {
    const app = express();
    app.use(cors());
    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
    const roomVideoUserList = {};
    // server
    io.on("connection", (socket) => {
      const user = socket.handshake.query.user;
      const room = socket.handshake.query.room;
      roomVideoUserList[room] = roomVideoUserList[room] || [];
      socket.on("disconnect", () => {
        console.log(`${user} leave ${room}`);
        if (roomVideoUserList[room]) {
          roomVideoUserList[room].splice(
            roomVideoUserList[room].indexOf(user),
            1
          );
        }
        socket.broadcast
          .to(room)
          .emit("initVideoUserList", roomVideoUserList[room]);
      });
      socket.join(room);
      socket.emit("initVideoUserList", roomVideoUserList[room]);
      socket.on("joinVideo", (user) => {
        socket.broadcast.to(room).emit("joinVideo", user);
        roomVideoUserList[room] = roomVideoUserList[room] || [];
        roomVideoUserList[room].push(user);
        io.to(room).emit("initVideoUserList", roomVideoUserList[room]);
      });
      socket.on("offer", (sendUser, receUser, offer) => {
        console.log(`${user}发出offer`);
        socket.broadcast.to(room).emit("offer", sendUser, receUser, offer);
      });
      socket.on("answer", (sendUser, receUser, answer) => {
        console.log(`${user}回复answer`);
        socket.broadcast.to(room).emit("answer", sendUser, receUser, answer);
      });
      socket.on("candidate", (sendUser, receUser, candidate) => {
        console.log(`${user}已就绪candidate`);
        socket.broadcast
          .to(room)
          .emit("candidate", sendUser, receUser, candidate);
      });
    });

    server.listen(this.port, () => {
      console.log(`server running at http://localhost:${this.port}`);
    });
  }
}

export default VideoSocket;
