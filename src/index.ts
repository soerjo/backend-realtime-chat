import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

dotenv.config();
const port = process.env.PORT;
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.get("/", (req: Request, res: Response) => {
  res.send("Express + Typescript Server");
});

io.on("connection", socket => {
  console.log("user : ", socket.id);

  socket.on("join_room", data => {
    socket.join(data);
    console.log("isi data: ", data);
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
