import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
    type: string;
    elementId: string;
    value: string;
    timestamp: string;
}

interface UseWebSocketProps {
    onMessage: (message: WebSocketMessage) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
}

export const useWebSocket = ({ onMessage, onError, onClose }: UseWebSocketProps) => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeout = useRef<NodeJS.Timeout>();

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
        };

        ws.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                console.log('Parsed WebSocket message:', message);
                onMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
            onError?.(error);
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            setIsConnected(false);
            onClose?.();
            
            // Only attempt to reconnect if the connection was closed unexpectedly
            if (event.code !== 1000) {
                console.log('Attempting to reconnect in 5 seconds...');
                reconnectTimeout.current = setTimeout(connect, 5000);
            }
        };
    }, [onMessage, onError, onClose]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                console.log('Cleaning up WebSocket connection');
                ws.current.close(1000, 'Component unmounting');
            }
        };
    }, [connect]);

    return { ws: ws.current, isConnected };
}; 