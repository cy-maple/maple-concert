const addZero = (value) => {
  return value < 10 ? "0" + value : value;
};
const getDate = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    "-" +
    addZero(date.getMonth() + 1) +
    "-" +
    addZero(date.getDate()) +
    " " +
    addZero(date.getHours()) +
    ":" +
    addZero(date.getMinutes()) +
    ":" +
    addZero(date.getSeconds())
  );
};

export default getDate;
