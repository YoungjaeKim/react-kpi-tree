import { Request, Response } from '../types/express';
import KpiElement from '../schemas/kpiElement';
import KpiElementRecordInteger from '../schemas/kpiElementRecordInteger';
import KpiElementRecordDouble from '../schemas/kpiElementRecordDouble';
import KpiElementRecordString from '../schemas/kpiElementRecordString';
import { isNullOrEmpty } from '../utils';

export const pushElement = async (req: Request, res: Response): Promise<void> => {
    try {
        const elementId = req.body.id;
        if (isNullOrEmpty(elementId)) {
            res.status(400).json({ error: "invalid id" });
            return;
        }

        // Find the current element
        const element = await KpiElement.findById(elementId);
        if (!element) {
            res.status(404).json({ error: "Element not found" });
            return;
        }

        // Create a record of the current value based on type
        let newRecord;
        switch (element.kpiValueType) {
            case 'Integer':
                newRecord = new KpiElementRecordInteger({
                    elementId: elementId,
                    recordValue: parseInt(element.kpiValue) || 0
                });
                break;
            case 'Double':
                newRecord = new KpiElementRecordDouble({
                    elementId: elementId,
                    recordValue: parseFloat(element.kpiValue) || 0.0
                });
                break;
            case 'String':
                newRecord = new KpiElementRecordString({
                    elementId: elementId,
                    recordValue: element.kpiValue || ""
                });
                break;
            default:
                throw new Error(`Unsupported value type: ${element.kpiValueType}`);
        }
        await newRecord.save();

        // Update the element with new values
        element.kpiValue = req.body.kpiValue;
        const updatedElement = await element.save();
        res.status(200).json({ ...updatedElement.toObject(), id: updatedElement._id, _id: undefined });
    } catch (err) {
        console.error('Failed to update element:', err);
        res.status(500).json({ error: 'Server error at pushElement' });
    }
};

export const getElements = async (req: Request, res: Response): Promise<void> => {
    const pageSize = 50; // Number of records to fetch per page
    const pageToken = parseInt(req.query.page as string, 10); // Token for the requested page

    // Check if pageToken is not a valid number
    const startIndex = (isNaN(pageToken) || pageToken < 0) ? 0 : pageToken;

    try {
        // Retrieve the resources with pagination
        const kpiElements = await KpiElement.find().skip(startIndex).limit(pageSize).exec();

        // Determine the next page token
        const nextPageToken = startIndex + pageSize;

        res.json({
            elements: kpiElements,
            nextPageToken: nextPageToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getElementById = async (req: Request, res: Response): Promise<void> => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    try {
        // Find the resource with the matching ID
        const resource = await KpiElement.findById(resourceId);

        if (!resource) {
            // Return a 404 response if the resource is not found
            res.status(404).json({ error: "Resource not found" });
        } else {
            // Return the resource as the response
            res.json({ ...resource.toObject(), id: resource._id, _id: undefined });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const createElement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, label, kpiValue, kpiValueType, isActive, expression } = req.body;
        
        const element = new KpiElement({
            title,
            label,
            kpiValue,
            kpiValueType,
            isActive,
            expression
        });

        await element.save();
        res.status(201).json(element);
    } catch (error) {
        console.error('Error creating element:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 