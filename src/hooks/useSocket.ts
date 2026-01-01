import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Custom hook for Socket.io connection
 * Manages connection lifecycle and provides socket instance
 * 
 * @returns {Socket | null} - Socket.io client instance
 */
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket.io connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
