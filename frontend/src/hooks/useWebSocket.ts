import { useEffect, useRef, useCallback } from 'react';

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

    const connect = useCallback(() => {
        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8080'}`;
        console.log('Attempting to connect to WebSocket at:', wsUrl);
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                onMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            onError?.(error);
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            onClose?.();
            // Attempt to reconnect after 5 seconds
            setTimeout(connect, 5000);
        };
    }, [onMessage, onError, onClose]);

    useEffect(() => {
        connect();

        return () => {
            if (ws.current) {
                console.log('Cleaning up WebSocket connection');
                ws.current.close();
            }
        };
    }, [connect]);

    return ws.current;
}; 