import { getReferenceOptions as getTalentOptions } from "./unifiedTalentProfile/referenceTables";
import { getProfessionalReferenceOptions } from "./unifiedProfessionalProfile/referenceTables";
import { getCastingDirectorReferenceOptions } from "./unifiedCastingDirectorProfile/referenceTables";

import { UNIFIED_TALENT_PROFILE_FIELD_SPEC } from "./unifiedTalentProfile/fieldSpec";
import { UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC } from "./unifiedProfessionalProfile/fieldSpec";
import { UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC } from "./unifiedCastingDirectorProfile/fieldSpec";

/**
 * Generates dummy data for a profile based on its field specifications.
 */
export const generateDummyProfileData = (
  typeOrFieldSpecs: string | any[],
  getOptionsOverride?: (source: string) => string[]
) => {
  const dummyData: Record<string, any> = {};
  
  let fieldSpecs: any[] = [];
  let getOptions = getOptionsOverride || getTalentOptions;

  if (typeof typeOrFieldSpecs === "string") {
    if (typeOrFieldSpecs === "talent") {
      fieldSpecs = UNIFIED_TALENT_PROFILE_FIELD_SPEC;
      getOptions = getOptionsOverride || getTalentOptions;
    } else if (typeOrFieldSpecs === "professional") {
      fieldSpecs = UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC;
      getOptions = getOptionsOverride || getProfessionalReferenceOptions;
    } else if (typeOrFieldSpecs === "director") {
      fieldSpecs = UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC;
      getOptions = getOptionsOverride || getCastingDirectorReferenceOptions;
    }
  } else if (Array.isArray(typeOrFieldSpecs)) {
    fieldSpecs = typeOrFieldSpecs;
  }

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
        else if (field.id === "height") dummyData[field.id] = "175";
        else if (field.id === "weight") dummyData[field.id] = "70";
        else if (field.id === "chest_bust_measurement") dummyData[field.id] = "86";
        else if (field.id === "waist_measurement") dummyData[field.id] = "86";
        else if (field.id === "hip_measurement") dummyData[field.id] = "86";
        else if (field.id === "inside_leg_measurement") dummyData[field.id] = "81";
        else if (field.id === "model_chest_bust") dummyData[field.id] = "86";
        else if (field.id === "model_waist") dummyData[field.id] = "86";
        else if (field.id === "model_hips") dummyData[field.id] = "86";
        else if (field.id === "model_dress_size") dummyData[field.id] = "8";
        else if (field.id === "model_shoe_size") dummyData[field.id] = "9";
        else if (field.id === "model_collar_size") dummyData[field.id] = "15";
        else if (field.id === "model_inseam") dummyData[field.id] = "32";
        else if (field.id === "model_suit_size") dummyData[field.id] = "40";
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
          // For visibility toggles, prefer "Yes"
          if (field.options.includes("Yes")) {
            dummyData[field.id] = "Yes";
          } else if (field.options.includes("Paid")) {
            dummyData[field.id] = "Paid";
          } else {
            dummyData[field.id] = field.options[0];
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
            // Take up to 3 items for multi-select
            dummyData[field.id] = options.slice(0, 3);
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
        if (field.id === "social_links") {
          dummyData[field.id] = ["https://instagram.com/mock", "https://linkedin.com/in/mock"];
        } else if (field.id === "software_tools" || field.id === "core_skills" || field.id === "photographer_specialisms" || field.id === "mua_specialisms" || field.id === "editing_specialisms") {
           dummyData[field.id] = ["Adobe Creative Suite", "Technical Proficiency", "Creative Direction"];
        } else {
          dummyData[field.id] = ["Excellence", "Diversity", "Innovation"];
        }
        break;
      default:
        break;
    }
    
    // Explicit overrides for professional and casting director fields
    if (field.id === "business_name") dummyData[field.id] = "Reed Professional Services";
    if (field.id === "professional_title") dummyData[field.id] = "Senior Industry Specialist";
    if (field.id === "core_skills") dummyData[field.id] = ["Adobe Creative Suite", "Project Management", "Technical Direction"];
    
    // Casting Director specific overrides
    if (field.id === "project_title") dummyData[field.id] = "Project Aurora";
    if (field.id === "production_company") dummyData[field.id] = "Reed International Studios";
    if (field.id === "production_type") dummyData[field.id] = "Feature Film";
    if (field.id === "genre") dummyData[field.id] = "Sci-Fi / Drama";
    if (field.id === "production_description") dummyData[field.id] = "A groundbreaking exploration of human resilience in a post-apocalyptic world. This feature film aims to push the boundaries of storytelling and visual effects.";
    if (field.id === "role_name") dummyData[field.id] = "Protagonist (Lead)";
    if (field.id === "role_description") dummyData[field.id] = "A complex character with a strong emotional range. Must be able to portray both vulnerability and intense strength.";
    if (field.id === "ethnicity") dummyData[field.id] = "Open to all ethnicities";
    if (field.id === "accent_requirements") dummyData[field.id] = "Standard British or American accent";
    if (field.id === "language_requirements") dummyData[field.id] = "Fluent English";
    if (field.id === "union_status_requirement") dummyData[field.id] = "Equity / SAG-AFTRA preferred";
    if (field.id === "compensation_notes") dummyData[field.id] = "Travel and accommodation provided. Daily per diem included.";
    
    if (field.id === "preaudition_instructions") dummyData[field.id] = "Please record a 60-second monologue from any classical play. Ensure good lighting and clear audio. Upload as a MP4 or MOV file.";
    if (field.id === "preaudition_question_text") dummyData[field.id] = "What is your primary acting experience?";
    if (field.id === "location_city") dummyData[field.id] = "London";
    if (field.id === "payment_amount") dummyData[field.id] = 500;
    if (field.id === "completed_castings") dummyData[field.id] = 15;
    if (field.id === "active_calls_count") dummyData[field.id] = 3;
    if (field.id === "response_time") dummyData[field.id] = "Within 24 hours";
    if (field.id === "years_of_experience") dummyData[field.id] = "10+ years";
  });

  return dummyData;
};


