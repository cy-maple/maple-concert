import "./index.less";

function SettingButton({ text, onClick }) {
  return (
    <div onClick={onClick} className="setting-button">
      {text}
    </div>
  );
}

export default SettingButton;
