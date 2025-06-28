import React, { useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { calculateExpression } from '../services/blockGraphService';
import { BlockNode } from '../types';

interface KpiDisplayNodeData {
    title: string;
    label: string;
    elementId: string;
    element?: {
        kpiValue: string;
        kpiValueType: string;
        expression?: string;
        lastUpdatedDateTime: string;
    };
    connectionStatus: boolean;
}

interface KpiDisplayNodeTypeProps {
    data: KpiDisplayNodeData;
    selected?: boolean;
    nodes?: BlockNode[]; // Add nodes prop for expression calculation
}

const KpiDisplayNodeType = ({ data, selected, nodes = [] }: KpiDisplayNodeTypeProps) => {
    const [kpiValue, setKpiValue] = useState(data.element?.kpiValue || '');
    const [lastUpdated, setLastUpdated] = useState(data.element?.lastUpdatedDateTime || '');
    const [animationKey, setAnimationKey] = useState(0);
    const { subscribeToNode } = useWebSocket();

    // Calculate expression value if expression exists
    const getDisplayValue = (): string => {
        if (data.element?.expression) {
            const calculatedValue = calculateExpression(data.element.expression, nodes);
            if (calculatedValue !== null) {
                return data.element.kpiValueType === 'Integer' 
                    ? Math.round(calculatedValue).toLocaleString()
                    : calculatedValue.toString();
            }
        }
        
        // Fall back to direct kpiValue
        return data.element?.kpiValueType === 'Integer' 
            ? Number(kpiValue).toLocaleString()
            : kpiValue || '-';
    };

    useEffect(() => {
        // Subscribe to updates for this specific node
        const unsubscribe = subscribeToNode(data.elementId, (message) => {
            if (message.type === 'kpi_update' && data.connectionStatus) {
                setKpiValue(message.value);
                setLastUpdated(message.timestamp);
                setAnimationKey(prev => prev + 1);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [data.elementId, data.connectionStatus, subscribeToNode]);

    return (
        <div className="kpi-display-node" style={{
            padding: '10px',
            borderRadius: '5px',
            width: '130px',
            fontSize: '12px',
            color: '#222',
            textAlign: 'center',
            borderWidth: selected ? '1px' : '0.5px',
            borderStyle: 'solid',
            backgroundColor: 'white',
            borderColor: selected ? '#1a192b' : '#cccccc',
            boxShadow: selected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            position: 'relative'
        }}>
            <Handle
                type='target'
                position={Position.Left}
                style={{ 
                    background: '#555',
                    width: '8px',
                    height: '8px'
                }}
            />

            {data.label && (
                <div style={{
                    borderRadius: '5px',
                    position: 'absolute',
                    top: '-8px',
                    left: '10px',
                    backgroundColor: 'white',
                    padding: '0 4px',
                    fontSize: '10px',
                    color: '#666'
                }}
                title="Label (optional)">
                    {data.label}
                </div>
            )}

            {(data.connectionStatus !== null && data.connectionStatus !== undefined) && (
                <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: data.connectionStatus ? '#4CAF50' : '#9E9E9E',
                    boxShadow: '0 0 2px rgba(0,0,0,0.2)'
                }}
                title={data.connectionStatus ? 'Connection Enabled' : 'Connection Disabled'}
                />
            )}

            <div className="kpi-display-node-content" style={{
                marginBottom: '8px',
                fontWeight: 'bold'
            }}>
                {data?.title || 'Untitled'}
            </div>
            <div 
                key={animationKey}
                style={{
                    padding: '4px',
                    backgroundColor: data.element?.expression ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: '3px',
                    fontSize: '11px',
                    animation: animationKey > 0 ? 'blink 1.0s ease-in-out' : 'none'
                }}
                title={data.element?.expression ? `Expression: ${data.element.expression}` : undefined}
            >
                {getDisplayValue()}
            </div>
            <Handle
                type='source'
                position={Position.Right}
                style={{ 
                    background: '#555',
                    width: '8px',
                    height: '8px'
                }}
            />

            <style>
                {`
                    @keyframes blink {
                        0% { background-color: #f5f5f5; }
                        20% { background-color: #91db93; }
                        50% { background-color: #91db93; }
                        100% { background-color: #f5f5f5; }
                    }
                `}
            </style>
        </div>
    );
}

export default KpiDisplayNodeType;