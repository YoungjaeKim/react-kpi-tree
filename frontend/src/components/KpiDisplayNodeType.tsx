import { Handle, Position, NodeProps } from '@xyflow/react';

interface KpiDisplayNodeData {
    title: string;
    label?: string;
    elementId: string;
    kpiValue?: string;
    kpiValueType?: string;
    element?: {
        kpiValue?: string;
        kpiValueType?: string;
    };
    connectionStatus?: boolean | null;
}

function KpiDisplayNodeType(props: NodeProps) {
    const data = props.data as unknown as KpiDisplayNodeData;
    const label = data?.label;
    const isSelected = props.selected;

    return (
        <div className="kpi-display-node" style={{
            padding: '10px',
            borderRadius: '5px',
            width: '130px',
            fontSize: '12px',
            color: '#222',
            textAlign: 'center',
            borderWidth: isSelected ? '1px' : '0.5px',
            borderStyle: 'solid',
            backgroundColor: 'white',
            borderColor: isSelected ? '#1a192b' : '#cccccc',
            boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
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

            {label && (
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
                    {label}
                </div>
            )}

            {data.connectionStatus !== null && (
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
            <div style={{
                padding: '4px',
                backgroundColor: '#f5f5f5',
                borderRadius: '3px',
                fontSize: '11px'
            }}>
                {data?.element?.kpiValueType === 'Integer' 
                    ? Number(data?.element?.kpiValue).toLocaleString()
                    : data?.element?.kpiValue || '-'}
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
        </div>
    );
}

export default KpiDisplayNodeType;