import "./index.less";

function SettingBox({ color, title, children }) {
  return (
    <div style={{ backgroundColor: color }} className="setting-box">
      <div className="title">{title}</div>
      {children}
    </div>
  );
}

export default SettingBox;
