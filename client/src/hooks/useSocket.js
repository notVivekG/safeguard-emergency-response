import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';

const useSocketEvent = (eventName, callback) => {
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    socket.on(eventName, callback);
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

export default useSocketEvent;
