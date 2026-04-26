import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SummaryField {
  id: string;
  label: string;
  section: string;
  type: string;
}

interface ProfileSummaryViewProps {
  fields: SummaryField[];
  values: Record<string, any>;
  title?: string;
}

export function ProfileSummaryView({ fields, values, title }: ProfileSummaryViewProps) {
  const getValue = React.useCallback((fieldId: string) => {
    // 1. Check direct match
    if (values[fieldId] !== undefined && values[fieldId] !== null && values[fieldId] !== "") {
      return values[fieldId];
    }

    // 2. Try camelCase version if fieldId is snake_case
    const camelId = fieldId.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (values[camelId] !== undefined && values[camelId] !== null && values[camelId] !== "") {
      return values[camelId];
    }

    // 3. Try snake_case version if fieldId is camelCase
    const snakeId = fieldId.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (values[snakeId] !== undefined && values[snakeId] !== null && values[snakeId] !== "") {
      return values[snakeId];
    }

    // 4. Check common nested objects (appearance, emergencyContact, guardianConsent, etc.)
    const nestedGroups = ["appearance", "emergencyContact", "guardianConsent", "talentProfile", "professionalProfile", "castingDirectorProfile", "talent", "professional"];
    for (const group of nestedGroups) {
      const groupObj = values[group];
      if (groupObj && typeof groupObj === "object") {
        // Try the suffix (e.g., if fieldId is guardian_full_name, check groupObj.fullName or groupObj.full_name)
        const parts = fieldId.split("_");
        const suffix = parts.length > 1 ? parts.slice(1).join("_") : fieldId;
        const suffixCamel = suffix.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        
        if (groupObj[suffix] !== undefined && groupObj[suffix] !== null && groupObj[suffix] !== "") return groupObj[suffix];
        if (groupObj[suffixCamel] !== undefined && groupObj[suffixCamel] !== null && groupObj[suffixCamel] !== "") return groupObj[suffixCamel];
        
        // Also try the full ID inside the group just in case
        if (groupObj[fieldId] !== undefined && groupObj[fieldId] !== null && groupObj[fieldId] !== "") return groupObj[fieldId];
        if (groupObj[camelId] !== undefined && groupObj[camelId] !== null && groupObj[camelId] !== "") return groupObj[camelId];
      }
    }

    // 5. Special mappings for common fields
    if (fieldId === "display_name" && values.stageName) return values.stageName;
    if (fieldId === "short_bio" && values.bio) return values.bio;
    if (fieldId === "full_bio" && values.fullAbout) return values.fullAbout;
    if (fieldId === "phone_number" && values.phone) return values.phone;

    return undefined;
  }, [values]);

  const sections = React.useMemo(() => {
    const grouped: Record<string, SummaryField[]> = {};
    fields.forEach((field) => {
      const val = getValue(field.id);
      const hasValue = 
        val !== null && 
        val !== undefined && 
        val !== "" && 
        !(Array.isArray(val) && val.length === 0);
      
      if (hasValue) {
        grouped[field.section] = grouped[field.section] || [];
        grouped[field.section].push(field);
      }
    });
    return Object.entries(grouped);
  }, [fields, getValue]);

  const renderValue = (field: SummaryField) => {
    const value = getValue(field.id);
    if (value === null || value === undefined || value === "") return "Not provided";
    
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((item, i) => (
            <Badge key={i} variant="secondary" className="bg-[#009698]/10 text-[#006b6d] border-[#009698]/20">
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }

    if (field.type === "boolean" || field.type === "checkbox") {
      return <Badge variant={value === "Yes" ? "default" : "outline"} className={value === "Yes" ? "bg-[#009698]" : ""}>{value}</Badge>;
    }

    if (field.type === "url" || (typeof value === "string" && value.startsWith("http"))) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#009698] hover:underline break-all">
          {value}
        </a>
      );
    }

    if (typeof value === "string" && value.startsWith("file:")) {
      return <span className="italic text-muted-foreground">{value.replace("file:", "")}</span>;
    }

    return <span className="text-foreground">{String(value)}</span>;
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-gray-900">No Details Yet</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Fill in your profile details in the other tabs to see your professional summary here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {title && (
        <div className="flex items-center gap-4 px-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {sections.map(([section, sectionFields]) => (
          <Card key={section} className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden rounded-3xl ring-1 ring-gray-200">
            <CardHeader className="bg-gray-50/50 px-6 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#006b6d]">
                {section}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {sectionFields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">{field.label}</p>
                    <div className="text-sm font-medium">
                      {renderValue(field)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
