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
    subscribeToNode: (elementId: string, callback: (message: WebSocketMessage) => void) => () => void;
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
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout>();
    const messageQueue = useRef<any[]>([]);
    const nodeSubscriptions = useRef<Map<string, Set<(message: WebSocketMessage) => void>>>(new Map());

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
            
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = undefined;
            }

            while (messageQueue.current.length > 0) {
                const message = messageQueue.current.shift();
                ws.current?.send(JSON.stringify(message));
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                // Notify all subscribers for this elementId
                const subscribers = nodeSubscriptions.current.get(message.elementId);
                if (subscribers) {
                    subscribers.forEach(callback => callback(message));
                }
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
            
            if (event.code !== 1000) {
                console.log('Attempting to reconnect in 5 seconds...');
                reconnectTimeout.current = setTimeout(connect, 5000);
            }
        };
    }, []);

    const sendMessage = useCallback((message: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            messageQueue.current.push(message);
        }
    }, []);

    const subscribeToNode = useCallback((elementId: string, callback: (message: WebSocketMessage) => void) => {
        if (!nodeSubscriptions.current.has(elementId)) {
            nodeSubscriptions.current.set(elementId, new Set());
        }
        nodeSubscriptions.current.get(elementId)?.add(callback);

        // Return unsubscribe function
        return () => {
            const subscribers = nodeSubscriptions.current.get(elementId);
            if (subscribers) {
                subscribers.delete(callback);
                if (subscribers.size === 0) {
                    nodeSubscriptions.current.delete(elementId);
                }
            }
        };
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
        <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribeToNode }}>
            {children}
        </WebSocketContext.Provider>
    );
}; 