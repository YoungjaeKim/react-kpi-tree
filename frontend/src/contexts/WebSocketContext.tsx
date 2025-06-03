import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
    type: string;
    elementId: string;
    value: string;
    timestamp: string;
}

interface WebSocketContextType {
    isConnected: boolean;
    sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: React.ReactNode;
    onMessage?: (message: WebSocketMessage) => void;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, onMessage }) => {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout>();
    const messageQueue = useRef<any[]>([]);

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8080'}`;
        console.log('Attempting to connect to WebSocket at:', wsUrl);
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
            setIsConnected(true);
            
            // Clear any pending reconnect timeout
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = undefined;
            }

            // Send any queued messages
            while (messageQueue.current.length > 0) {
                const message = messageQueue.current.shift();
                ws.current?.send(JSON.stringify(message));
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                onMessage?.(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            setIsConnected(false);
            
            // Only attempt to reconnect if the connection was closed unexpectedly
            if (event.code !== 1000) {
                console.log('Attempting to reconnect in 5 seconds...');
                reconnectTimeout.current = setTimeout(connect, 5000);
            }
        };
    }, [onMessage]);

    const sendMessage = useCallback((message: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            messageQueue.current.push(message);
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                ws.current.close(1000, 'Component unmounting');
            }
        };
    }, [connect]);

    return (
        <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
}; 