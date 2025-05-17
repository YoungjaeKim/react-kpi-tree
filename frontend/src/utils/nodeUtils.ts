import { BlockElement, BlockNode } from '../types';

export function toBlockNode(n: any): BlockNode {
    return {
        id: n.id,
        position: { x: n.position.x, y: n.position.y },
        groupId: n.groupId,
        data: {
            title: n.title,
            label: n.label,
            elementId: n.elementId ? n.elementId : n.element?.id,
            element: n.element as BlockElement
        },
        hidden: n.hidden ?? false,
        type: 'kpiDisplayNodeType'
    } as BlockNode;
} 