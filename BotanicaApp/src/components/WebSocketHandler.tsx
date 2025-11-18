import React from 'react';
import { useWebSocketHandler } from '../hooks/useWebSocketHandler';

export const WebSocketHandler: React.FC = () => {
  useWebSocketHandler();
  return null;
};