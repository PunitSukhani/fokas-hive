// Global socket instance utility
let io = null;

export const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

export const getSocketInstance = () => {
  return io;
};
