import { Handle, Position, NodeProps } from '@xyflow/react';

interface KpiDisplayNodeData {
    title: string;
    label?: string;
    elementId: string;
    kpiValue?: string;
    kpiValueType?: string;
    element?: {
        kpiValue?: string;
    };
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
                    position: 'absolute',
                    top: '-8px',
                    left: '10px',
                    backgroundColor: 'white',
                    padding: '0 4px',
                    fontSize: '10px',
                    color: '#666'
                }}>
                    {label}
                </div>
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
                {data?.element?.kpiValue || '-'}
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