import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import cors from "cors";
import http from "http";

dotenv.config();
const originUrl = process.env.ORIGIN || "http://localhost:3000";
console.log(originUrl);
const port = process.env.PORT;
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: originUrl,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.get("/", (req: Request, res: Response) => {
  res.send("Express + Typescript Server");
});

type Users = {
  username: string;
  userId: string;
  room: string;
};

const users: Users[] = [];

const userJoin = (userName: string, userId: string, roomId: string) => {
  const findIndex = users.findIndex(
    user => user.username === userName || user.userId === userId
  );
  if (findIndex > 0) {
    users[findIndex] = {
      ...users[findIndex],
      room: roomId,
      username: userName,
    };
  } else {
    users.push({ username: userName, userId: userId, room: roomId });
  }
};

const joinRoom = (socket: Socket, roomid: string, userId: string) => {
  const userRoom = users.find(user => user?.userId !== userId);
  if (userRoom && userRoom.room !== roomid) {
    socket.to(userRoom.room).emit("receive_message", {
      author: userRoom.username,
      message: "leave the room",
      time: new Date().getTime(),
    });
    socket.leave(userRoom.room);
  }
  socket.join(roomid);
};

io.on("connection", socket => {
  console.log("user : ", socket.id);

  socket.on("join_room", ({ userName, roomId }) => {
    userJoin(userName, socket.id, roomId);
    joinRoom(socket, roomId, socket.id);

    console.log(users);
  });

  socket.on("send_message", data => {
    console.log("isi message: ", data);
    socket.to(data.room).emit("receive_message", {
      author: data.author,
      message: data.message,
      time: data.time,
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
