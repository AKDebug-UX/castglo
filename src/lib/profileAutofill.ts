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
        if (field.id === "full_name") dummyData[field.id] = "Alexander Reed";
        else if (field.id === "display_name") dummyData[field.id] = "Alex Reed Casting";
        else if (field.id === "professional_title") dummyData[field.id] = "Senior Casting Director";
        else if (field.id === "company_name") dummyData[field.id] = "Reed International Casting";
        else if (field.id === "city" || field.id === "location_city") dummyData[field.id] = "London";
        else if (field.id === "project_title") dummyData[field.id] = "Project Aurora";
        else if (field.id === "role_name") dummyData[field.id] = "Protagonist (Lead)";
        else if (field.id === "preaudition_question_text") dummyData[field.id] = "What is your primary acting experience?";
        else if (field.id === "preaudition_deadline") dummyData[field.id] = "Next Friday";
        else dummyData[field.id] = `Mock ${field.label}`;
        break;
      case "email":
        dummyData[field.id] = `contact@${field.id.replace('_', '-') || 'casting'}.com`;
        break;
      case "phone":
        dummyData[field.id] = "+44 20 7123 4567";
        break;
      case "date":
        dummyData[field.id] = new Date().toISOString().split('T')[0];
        break;
      case "boolean":
      case "checkbox":
        dummyData[field.id] = true;
        break;
      case "number":
      case "integer":
        if (field.id.includes("height")) dummyData[field.id] = 180;
        else if (field.id.includes("weight")) dummyData[field.id] = 75;
        else if (field.id.includes("amount") || field.id.includes("rate")) dummyData[field.id] = 500;
        else if (field.id.includes("experience")) dummyData[field.id] = 10;
        else dummyData[field.id] = 5;
        break;
      case "url":
        dummyData[field.id] = `https://www.${field.id.replace('_', '-')}.com`;
        break;
      case "textarea":
        if (field.id === "preaudition_instructions") {
          dummyData[field.id] = "Please record a 60-second monologue from any classical play. Ensure good lighting and clear audio. Upload as a MP4 or MOV file.";
        } else {
          dummyData[field.id] = `This is a comprehensive mock description for the ${field.label}. We are looking for high-quality talent with specific skills and experience in this area. Our production company is known for its excellence and professional environment.`;
        }
        break;
      case "select":
        if (field.options && field.options.length > 0) {
          dummyData[field.id] = field.options[0];
          // For visibility toggles, prefer boolean true for "Yes" to match form logic
          if (field.options.includes("Yes")) {
            dummyData[field.id] = true;
          } else if (field.options.includes("Paid")) {
            dummyData[field.id] = "Paid";
          }
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
            // Take up to 2 items for multi-select
            dummyData[field.id] = options.slice(0, 2);
          }
        } else {
          dummyData[field.id] = [];
        }
        break;
      case "url-list":
        dummyData[field.id] = ["https://vimeo.com/channels/mock"];
        break;
      case "credits-list":
        dummyData[field.id] = [
          { role: "Casting Director", production: "Mock Blockbuster", director: "John Smith", year: "2023" }
        ];
        break;
      case "multi-item-text":
        dummyData[field.id] = ["Excellence", "Diversity", "Innovation"];
        break;
      default:
        break;
    }
  });

  return dummyData;
};


