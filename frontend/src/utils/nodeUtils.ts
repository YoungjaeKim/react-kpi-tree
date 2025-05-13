import { BlockNode } from '../types';

export function toBlockNode(n: any): BlockNode {
    const kpiValue = n.element?.kpiValue || '';
    return {
        id: n.id,
        position: { x: n.position.x, y: n.position.y },
        groupId: n.groupId,
        data: { 
            label: `${n.title} (${n.label})${kpiValue ? `\nvalue: ${kpiValue}` : ''}`, 
            elementId: n.element?.id 
        },
        hidden: n.hidden ?? false
    } as BlockNode;
} 