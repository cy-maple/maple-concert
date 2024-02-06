import "./index.less";
function UserList({ userList, closeUserList }) {
  return (
    <div className="user-list">
      <div className="cancel-button" onClick={() => closeUserList()}>
        x
      </div>
      {userList.map((user) => {
        return <div className="user-info">{user}</div>;
      })}
    </div>
  );
}

export default UserList;
