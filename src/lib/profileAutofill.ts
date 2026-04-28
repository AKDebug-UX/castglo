import { getReferenceOptions as getTalentOptions } from "./unifiedTalentProfile/referenceTables";

/**
 * Generates dummy data for a profile based on its field specifications.
 */
export const generateDummyProfileData = (
  fieldSpecs: any[],
  getOptionsOverride?: (source: string) => string[]
) => {
  const dummyData: Record<string, any> = {};
  const getOptions = getOptionsOverride || getTalentOptions;

  fieldSpecs.forEach((field) => {
    // Basic types
    switch (field.type) {
      case "text":
        if (field.id === "full_name") dummyData[field.id] = "John Doe";
        else if (field.id === "display_name" || field.id === "stage_name" || field.id === "stageName") dummyData[field.id] = "Johnnie";
        else if (field.id === "city" || field.id === "location_city") dummyData[field.id] = "London";
        else dummyData[field.id] = `Mock ${field.label}`;
        break;
      case "email":
        dummyData[field.id] = `mock.${field.id}@example.com`;
        break;
      case "phone":
        dummyData[field.id] = "+2348012345678";
        break;
      case "date":
        dummyData[field.id] = "1995-05-15";
        break;
      case "boolean":
      case "checkbox":
        dummyData[field.id] = "Yes";
        break;
      case "number":
      case "integer":
        if (field.id.includes("height")) dummyData[field.id] = "180";
        else if (field.id.includes("weight")) dummyData[field.id] = "75";
        else dummyData[field.id] = 10;
        break;
      case "url":
        dummyData[field.id] = "https://example.com";
        break;
      case "textarea":
        dummyData[field.id] = `This is a high-quality mock description for the ${field.label} field. It is designed to be long enough to meet any character requirements.`;
        break;
      case "select":
        if (field.options && field.options.length > 0) {
          dummyData[field.id] = field.options[0];
        } else if (field.optionSource) {
          const options = getOptions(field.optionSource);
          if (options && options.length > 0) {
            dummyData[field.id] = options[0];
          }
        }
        break;
      case "multi-select":
        if (field.options && field.options.length > 0) {
          dummyData[field.id] = [field.options[0]];
        } else if (field.optionSource) {
          const options = getOptions(field.optionSource);
          if (options && options.length > 0) {
            dummyData[field.id] = [options[0]];
          }
        } else {
          dummyData[field.id] = [];
        }
        break;
      case "url-list":
        dummyData[field.id] = ["https://youtube.com/watch?v=mock"];
        break;
      case "credits-list":
        dummyData[field.id] = [
          { role: "Lead Actor", production: "Mock Feature Film", director: "Jane Smith", year: "2024" }
        ];
        break;
      case "multi-item-text":
        dummyData[field.id] = ["Item Alpha", "Item Beta"];
        break;
      default:
        // Skip files
        break;
    }
  });

  return dummyData;
};


