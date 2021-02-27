const users = [];

const addUser = ({ id, name, room }) => {
  //name conversion to lowercase without spaces
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //check if user already exists
  const userExists = users.find(
    (user) => user.room === room && user.name === name
  );
  if (userExists) {
    return { error: "Username is already taken" };
  }
  //if user doesn't exist
  const user = { id, name, room };
  users.push(user);

  return { user };
};
const removeUser = (id) => {
  //try to find user
  const index = users.findIndex((user) => user.id === id);
  //if user exists remove from users array
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};
const getUser = (id) => {
  return users.find((user) => user.id === id);
};
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
