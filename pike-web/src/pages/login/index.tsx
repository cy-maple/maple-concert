import { useNavigate } from "react-router-dom";
import "./index.less";
import formDom from "@/types/formDom";
function Login() {
  const navigate = useNavigate();
  // 进入房间
  const toHome = () => {
    const user: formDom = document.querySelector(".username input") as formDom;
    const room: formDom = document.querySelector(".roomname input") as formDom;
    if (user.value.length > 5 || room.value.length > 5) {
      alert("用户名和房间名长度不可超过5个字符!");
      return;
    }
    navigate("/home", { state: { user: user.value, room: room.value } });
  };
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="input-box">
          <div className="username">
            <input type="text" placeholder="用户名" />
          </div>
          <div className="roomname">
            <input type="text" placeholder="房间名" />
          </div>
          <button onClick={toHome}>加入房间</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
