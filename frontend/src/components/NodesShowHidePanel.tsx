import React from 'react';
import { BlockNode } from '../types';

interface NodesShowHidePanelProps {
    hiddenNodes: BlockNode[];
    selectedHiddenNode: string;
    onSelectedHiddenNodeChange: (nodeId: string) => void;
    onRefresh: () => void;
    onMakeVisible: () => void;
}

export const NodesShowHidePanel: React.FC<NodesShowHidePanelProps> = ({
    hiddenNodes,
    selectedHiddenNode,
    onSelectedHiddenNodeChange,
    onRefresh,
    onMakeVisible
}) => {
    return (
        <div>
            <select 
                value={selectedHiddenNode} 
                onChange={(e) => onSelectedHiddenNodeChange(e.target.value)}
                aria-label="Select hidden node"
            >
                <option value="">Select Hidden Node</option>
                {hiddenNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                        {node.data.label}
                    </option>
                ))}
            </select>
            <button onClick={onRefresh}>Refresh</button>
            <button 
                onClick={onMakeVisible}
                disabled={!selectedHiddenNode}
            >
                Add
            </button>
        </div>
    );
}; 