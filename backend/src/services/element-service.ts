import KpiElement from '../schemas/kpiElement';
import KpiElementRecordInteger from '../schemas/kpiElementRecordInteger';
import KpiElementRecordDouble from '../schemas/kpiElementRecordDouble';
import KpiElementRecordString from '../schemas/kpiElementRecordString';
import { IKpiElement } from '../schemas/kpiElement'; // Assuming IKpiElement is exported

export class ElementService {

    /**
     * Finds an element, records its current kpiValue, and then updates the kpiValue.
     * @param elementId The ID of the element to update.
     * @param newKpiValue The new KPI value to set.
     * @returns The updated KpiElement document or null if not found or error.
     */
    public async recordAndUpdateKpiValue(elementId: string, newKpiValue: string): Promise<IKpiElement | null> {
        try {
            // Find the current element
            const element = await KpiElement.findById(elementId);
            if (!element) {
                console.error(`Element not found with ID: ${elementId}`);
                return null;
            }

            // Create a record of the current value based on type
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
                    // Optionally throw an error or handle as appropriate
                    return null; // Or throw new Error(...)
            }
            await newRecord.save();

            // Update the element with the new kpiValue
            element.kpiValue = newKpiValue;
            const updatedElement = await element.save();
            return updatedElement;

        } catch (err) {
            console.error(`Failed to update element value for ID ${elementId}:`, err);
            return null; // Or throw err depending on desired error handling
        }
    }
} 