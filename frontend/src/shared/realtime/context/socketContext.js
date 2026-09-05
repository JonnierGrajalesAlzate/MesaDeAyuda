import { createContext } from "react";
import socket from "../socket.js";
const SocketContext = createContext({
  socket,
  conectado: false
});
export default SocketContext;
