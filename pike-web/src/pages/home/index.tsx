import "./index.less";
import {
  ThunderboltFilled,
  DeleteOutlined,
  HistoryOutlined,
  AudioFilled,
} from "@ant-design/icons";
import getDate from "../../utils/date";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatContent, { ChatData } from "../../components/chat-content";
import { Avatar, Button } from "antd";
import ColorHash from "color-hash";
let socket = null;
const scrollToBottom = () => {
  const messageView = document.querySelector(".chat-area-body");
  messageView.scrollTop = messageView.scrollHeight - messageView.clientHeight;
};
function Home() {
  const [chatData, setChatData] = useState([]);
  const location = useLocation();
  const room = location.state.room;
  const user = location.state.user;
  const color = new ColorHash().hex(room);
  useEffect(() => {
    // 连接socket
    socket = io("http://localhost:3000", {
      query: {
        room: room,
        user: user,
      },
    });
    setTimeout(() => {
      scrollToBottom();
    }, 50);
    socket.on("chat", (msg) => {
      setChatData((msgArr) => [...msgArr, msg]);
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    });

    // 获取历史消息
    socket.on("init", (msgArr) => {
      setChatData(msgArr);
    });
  }, []);
  const pushMessage = () => {
    const input = document.querySelector("input");
    const message: ChatData = {
      user: user,
      text: input.value,
      date: getDate(),
    };
    input.value = "";
    socket.emit("chat", room, message);
  };
  return (
    <div className="home-page">
      <div className="chat-area">
        <div className="chat-area-header">
          <Avatar
            style={{
              backgroundColor: color,
              verticalAlign: "middle",
              marginLeft: "10px",
              marginRight: "10px",
            }}
            size={60}
          >
            聊天室
          </Avatar>
          {room}
        </div>
        <div className="chat-area-body">
          <ChatContent chatData={chatData} user={user} />
        </div>
        <div className="chat-area-footer">
          <div className="chat-input">
            <div className="input-box">
              <input type="text" placeholder="Please enter..." />
            </div>
            <Button
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#ddd", marginLeft: "8px" }}
              icon={<DeleteOutlined style={{ color: "#000" }} />}
            ></Button>
            <Button
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#ddd", marginLeft: "8px" }}
              icon={<HistoryOutlined style={{ color: "#000" }} />}
            ></Button>
            <Button
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#ddd", marginLeft: "8px" }}
              icon={<AudioFilled style={{ color: "#000" }} />}
            ></Button>
            <Button
              onClick={pushMessage}
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#4bb150", marginLeft: "8px" }}
              icon={<ThunderboltFilled style={{ color: "#fff" }} />}
            ></Button>
          </div>
        </div>
      </div>
      <div className="setting-area"></div>
    </div>
  );
}

export default Home;
