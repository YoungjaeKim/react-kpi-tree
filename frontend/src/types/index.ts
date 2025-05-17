import { Node } from '@xyflow/react';

export interface BlockNode extends Node {
    groupId: string;
    data: {
        label: string;
        elementId: string;
        title?: string;
        kpiValue?: string;
        kpiValueType?: string;
    };
    hidden: boolean;
}

export interface BlockNodeTransferForCreate {
    position: { x: number; y: number };
    groupId: string;
    title: string;
    label: string;
    elementValue: string;
    elementValueType: string;
    elementIsActive: boolean;
    elementExpression: string;
    elementId: string;
}


export interface BlockEdge {
    id: string;
    source: string;
    target: string;
    groupId: string;
}

export interface BlockEdgeTransferForCreate {
    source: string;
    target: string;
    groupId: string;
}

export interface NodeFormData {
    title: string;
    label: string;
    elementValueType: string;
    elementValue: string;
}
