import { Node } from '@xyflow/react';

export interface BlockNode extends Node {
    groupId: string;
    data: {
        title: string;
        label?: string;
        elementId: string;
        kpiValue?: string;
        kpiValueType?: string;
        element?: BlockElement;
        connectionStatus?: boolean | null;
        connectionType?: string;
    };
    hidden: boolean;
}

export interface BlockElement {
    id: string;
    kpiValue: string;
    kpiValueType: string;
    isActive: boolean;
    expression?: string;
    lastUpdatedDateTime: Date;
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
