import { Handle, Position } from '@xyflow/react';

interface KpiDisplayNodeData {
    title: string;
    label?: string;
    elementId: string;
    kpiValue?: string;
    kpiValueType?: string;
}

function KpiDisplayNodeType(node: any) {
    // Safely access data with optional chaining and default values
    const data = node?.data;
    const label = data?.label;

    return (
        <div className="kpi-display-node">
            <Handle
                type='target'
                position={Position.Top}
            />

            <div className="kpi-display-node-content">
                {data?.title || 'Untitled'} {label && `(${label})`}
            </div>
            <div>
                {data?.element?.kpiValue}
            </div>
            <Handle
                type='source'
                position={Position.Bottom}
            />
        </div>
    );
}

export default KpiDisplayNodeType;