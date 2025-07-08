import KpiElement from '../schemas/kpiElement';
import KpiElementRecordInteger from '../schemas/kpiElementRecordInteger';
import KpiElementRecordDouble from '../schemas/kpiElementRecordDouble';
import KpiElementRecordString from '../schemas/kpiElementRecordString';
import { IKpiElement } from '../schemas/kpiElement'; // Assuming IKpiElement is exported

export class ElementService {

    /**
     * Updates an element with either kpiValue, expression, or both.
     * If kpiValue is provided, it records the current value before updating.
     * @param elementId The ID of the element to update.
     * @param updates Object containing the fields to update
     * @returns The updated KpiElement document or null if not found or error.
     */
    public async updateElement(elementId: string, updates: { kpiValue?: string; expression?: string }): Promise<IKpiElement | null> {
        try {
            // Find the current element
            const element = await KpiElement.findById(elementId);
            if (!element) {
                console.error(`Element not found with ID: ${elementId}`);
                return null;
            }

            // If updating kpiValue, create a record of the current value first
            if (updates.kpiValue !== undefined) {
                let newRecord;
                switch (element.kpiValueType) {
                    case 'Integer':
                        newRecord = new KpiElementRecordInteger({
                            elementId: element._id,
                            recordValue: parseInt(element.kpiValue, 10) || 0
                        });
                        break;
                    case 'Double':
                        newRecord = new KpiElementRecordDouble({
                            elementId: element._id,
                            recordValue: parseFloat(element.kpiValue) || 0.0
                        });
                        break;
                    case 'String':
                        newRecord = new KpiElementRecordString({
                            elementId: element._id,
                            recordValue: element.kpiValue || ""
                        });
                        break;
                    default:
                        console.error(`Unsupported value type: ${element.kpiValueType} for element ID: ${elementId}`);
                        return null;
                }
                await newRecord.save();
                
                // Update the kpiValue
                element.kpiValue = updates.kpiValue;
            }

            // Update expression if provided
            if (updates.expression !== undefined) {
                element.expression = updates.expression;
            }

            // Save the updated element
            const updatedElement = await element.save();
            return updatedElement;

        } catch (err) {
            console.error(`Failed to update element for ID ${elementId}:`, err);
            return null;
        }
    }

} 