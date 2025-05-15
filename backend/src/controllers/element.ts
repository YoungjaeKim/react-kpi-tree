import { Request, Response } from '../types/express';
import KpiElement from '../schemas/kpiElement';
import { isNullOrEmpty } from '../utils';
import { ElementService } from '../services/element-service';

const getElementService = (req: Request): ElementService => req.app.locals.elementService as ElementService;

export const pushElement = async (req: Request, res: Response): Promise<void> => {
    const elementService = getElementService(req);

    try {
        const elementId = req.body.id as string;
        const newKpiValue = req.body.kpiValue as string;

        if (isNullOrEmpty(elementId)) {
            res.status(400).json({ error: "invalid id" });
            return;
        }
        if (isNullOrEmpty(newKpiValue)) {
            res.status(400).json({ error: "kpiValue is required" });
            return;
        }

        const updatedElement = await elementService.recordAndUpdateKpiValue(elementId, newKpiValue);

        if (!updatedElement) {
            res.status(404).json({ error: "Element not found or failed to update" }); 
            return;
        }

        res.status(200).json({ ...updatedElement.toObject(), id: updatedElement._id, _id: undefined });
    } catch (err) {
        console.error('Error in pushElement controller:', err);
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
