import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.less";
import Home from "./pages/home/index";
import Login from "./pages/login/index";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="*" element={<div>404</div>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
