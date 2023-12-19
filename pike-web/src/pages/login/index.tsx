import { useNavigate } from "react-router-dom";
import "./index.less";
function Login() {
  const navigate = useNavigate();
  const toHome = () => {
    const user = document.querySelector(".username input");
    const room = document.querySelector(".roomname input");
    console.log(user?.value, room?.value);
    navigate("/home", { state: { user: user.value, room: room.value } });
  };
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="input-box">
          <div className="username">
            用户名:
            <input type="text" />
          </div>
          <div className="roomname">
            房间名:
            <input type="text" />
          </div>
          <button onClick={toHome}>加入房间</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
