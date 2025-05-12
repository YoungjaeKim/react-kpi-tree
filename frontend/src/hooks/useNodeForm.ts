import { useState } from 'react';
import { NodeFormData } from '../types';

export const useNodeForm = () => {
    const [title, setTitle] = useState<string>("");
    const [label, setLabel] = useState<string>("");
    const [elementValueType, setElementValueType] = useState<string>("Integer");
    const [elementValue, setElementValue] = useState<string>("0");
    const [elementValueError, setElementValueError] = useState<string>("");

    const handleElementValueTypeChange = (type: string) => {
        setElementValueType(type);
        switch (type) {
            case "Integer":
                setElementValue("0");
                break;
            case "Double":
                setElementValue("0.0");
                break;
            case "String":
                setElementValue("");
                break;
        }
        setElementValueError("");
    };

    const validateElementValue = (value: string, type: string): boolean => {
        let isValid = false;
        switch (type) {
            case "Integer":
                isValid = /^-?\d+$/.test(value);
                if (!isValid) {
                    setElementValueError("Invalid Integer value");
                } else {
                    setElementValue(value.trim());
                }
                break;
            case "Double":
                isValid = /^-?\d*\.?\d+$/.test(value);
                if (!isValid) {
                    setElementValueError("Invalid Double value");
                } else {
                    setElementValue(value.trim());
                }
                break;
            case "String":
                isValid = true;
                setElementValueError("");
                setElementValue(value);
                break;
            default:
                isValid = false;
                setElementValueError("Invalid value type");
        }
        return isValid;
    };

    const resetForm = () => {
        setTitle("");
        setLabel("");
        setElementValueType("Integer");
        setElementValue("0");
        setElementValueError("");
    };

    return {
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
    };
}; 