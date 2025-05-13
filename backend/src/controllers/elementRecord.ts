import { Request, Response } from '../types/express';
import KpiElementRecordString from '../schemas/kpiElementRecordString';
import KpiElementRecordInteger from '../schemas/kpiElementRecordInteger';
import KpiElementRecordDouble from '../schemas/kpiElementRecordDouble';
import { Model } from 'mongoose';

type RecordType = 'string' | 'integer' | 'double';

const getModelByType = (type: RecordType): Model<any> => {
    switch (type.toLowerCase()) {
        case 'string':
            return KpiElementRecordString;
        case 'integer':
            return KpiElementRecordInteger;
        case 'double':
            return KpiElementRecordDouble;
        default:
            throw new Error(`Unsupported type: ${type}`);
    }
};

export const getElementRecords = async (_req: Request, res: Response): Promise<void> => {
    try {
        const records = await Promise.all([
            KpiElementRecordString.find(),
            KpiElementRecordInteger.find(),
            KpiElementRecordDouble.find()
        ]);
        
        res.json({
            string: records[0],
            integer: records[1],
            double: records[2]
        });
    } catch (error) {
        console.error('Error fetching element records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createElementRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const { elementId, value, type } = req.body;
        
        const Model = getModelByType(type as RecordType);
        const record = new Model({
            elementId,
            value
        });

        await record.save();
        res.status(201).json(record);
    } catch (error) {
        console.error('Error creating element record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getElementRecordsByElementId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { elementId } = req.params;
        const { type } = req.query;

        if (type) {
            const Model = getModelByType(type as RecordType);
            const records = await Model.find({ elementId });
            res.json(records);
        } else {
            const records = await Promise.all([
                KpiElementRecordString.find({ elementId }),
                KpiElementRecordInteger.find({ elementId }),
                KpiElementRecordDouble.find({ elementId })
            ]);
            
            res.json({
                string: records[0],
                integer: records[1],
                double: records[2]
            });
        }
    } catch (error) {
        console.error('Error fetching element records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 