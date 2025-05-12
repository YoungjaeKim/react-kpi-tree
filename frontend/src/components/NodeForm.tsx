import React from 'react';
import { useNodeForm } from '../hooks/useNodeForm';
import { addNode } from '../services/nodeService';

interface NodeFormProps {
    groupId: string;
    onNodeAdded: () => void;
}

export const NodeForm: React.FC<NodeFormProps> = ({ groupId, onNodeAdded }) => {
    const {
        title,
        setTitle,
        label,
        setLabel,
        elementValueType,
        elementValue,
        setElementValue,
        elementValueError,
        handleElementValueTypeChange,
        validateElementValue,
        resetForm
    } = useNodeForm();

    const handleSubmit = async () => {
        if (!validateElementValue(elementValue, elementValueType)) {
            return;
        }

        const newNode = {
            position: { x: 100, y: 100 },
            groupId: groupId,
            title: title,
            label: label || title,
            elementValue: elementValue.trim(),
            elementValueType: elementValueType,
            elementIsActive: true,
            elementExpression: "",
            elementId: ""
        };

        try {
            await addNode(newNode);
            resetForm();
            onNodeAdded();
        } catch (error) {
            console.error('Failed to add node:', error);
        }
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Label" 
                value={label} 
                onChange={(e) => setLabel(e.target.value)} 
            />
            <select 
                value={elementValueType} 
                onChange={(e) => handleElementValueTypeChange(e.target.value)}
                aria-label="Select element value type"
            >
                <option value="Integer">Integer</option>
                <option value="Double">Double</option>
                <option value="String">String</option>
            </select>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input 
                    type="text" 
                    placeholder="Element Value" 
                    value={elementValue} 
                    onChange={(e) => {
                        if (validateElementValue(e.target.value, elementValueType)) {
                            setElementValue(e.target.value);
                        }
                    }}
                    style={{ borderColor: elementValueError ? 'red' : undefined }}
                />
                {elementValueError && (
                    <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
                        {elementValueError}
                    </span>
                )}
            </div>
            <button onClick={handleSubmit}>Add Node</button>
        </div>
    );
}; 