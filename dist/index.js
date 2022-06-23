"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const port = process.env.PORT;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("Express + Typescript Server");
});
const users = [];
const userJoin = (userName, userId, roomId) => {
    const findIndex = users.findIndex(user => user.username === userName || user.userId === userId);
    if (findIndex > 0) {
        users[findIndex] = Object.assign(Object.assign({}, users[findIndex]), { room: roomId, username: userName });
    }
    else {
        users.push({ username: userName, userId: userId, room: roomId });
    }
};
const joinRoom = (socket, roomid, userId) => {
    const userRoom = users.find(user => (user === null || user === void 0 ? void 0 : user.userId) !== userId);
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
