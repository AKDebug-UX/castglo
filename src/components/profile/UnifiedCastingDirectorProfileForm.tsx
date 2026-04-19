import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  castingDirectorSectionTabMap,
  CastingDirectorFieldSpec,
  shouldShowCastingDirectorField,
  UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC,
} from "@/lib/unifiedCastingDirectorProfile/fieldSpec";
import { getCastingDirectorReferenceOptions } from "@/lib/unifiedCastingDirectorProfile/referenceTables";
import { MultiSelectChecklist } from "./fields/MultiSelectChecklist";

type CastingProfileTab = "overview" | "hiring" | "projects" | "roles" | "audition" | "commercial" | "navigation";

interface UnifiedCastingDirectorProfileFormProps {
  rootData: any;
  onChange: (nextRootData: any) => void;
  onSave?: () => void;
  isSaving?: boolean;
  activeTab?: CastingProfileTab;
}

const sectionOrder = [
  "Basic Information",
  "Professional Identity",
  "Credibility / Trust",
  "Hiring Manager Tools",
  "Applicant Management",
  "Project / Casting Call",
  "Role Management",
  "Pre-Audition Workflow",
  "Pre-Audition Form",
  "Marketplace / Commercial",
  "Profile Navigation",
];

const asArray = (value: any): string[] => (Array.isArray(value) ? value.map(String) : []);
const parseList = (value: string): string[] => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);



export function UnifiedCastingDirectorProfileForm({ rootData, onChange, onSave, isSaving = false, activeTab }: UnifiedCastingDirectorProfileFormProps) {
  const unified = rootData?.unifiedCastingDirectorProfile || {};
  const values = { ...rootData, ...unified };

  const visibleFields = useMemo(() => {
    const base = UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC.filter((field) => shouldShowCastingDirectorField(field, values));
    if (!activeTab) return base;
    return base.filter((field) => (castingDirectorSectionTabMap[field.section] || "overview") === activeTab);
  }, [values, activeTab]);

  const sections = useMemo(() => {
    const grouped: Record<string, CastingDirectorFieldSpec[]> = {};
    for (const field of visibleFields) {
      grouped[field.section] = grouped[field.section] || [];
      grouped[field.section].push(field);
    }

    return Object.entries(grouped).sort(([a], [b]) => {
      const ai = sectionOrder.indexOf(a);
      const bi = sectionOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [visibleFields]);

  const setFieldValue = (fieldId: string, value: any) => {
    onChange({
      ...rootData,
      [fieldId]: value,
      unifiedCastingDirectorProfile: {
        ...unified,
        [fieldId]: value,
      },
    });
  };

  const optionsFor = (field: CastingDirectorFieldSpec): string[] => {
    if (field.options?.length) return field.options;
    if (field.optionSource) return getCastingDirectorReferenceOptions(field.optionSource);
    return [];
  };

  const renderField = (field: CastingDirectorFieldSpec) => {
    const value = values[field.id];
    const options = optionsFor(field);

    switch (field.type) {
      case "boolean":
        return (
          <Select 
            value={value || ""} 
            onValueChange={(next) => setFieldValue(field.id, next)}
          >
            <SelectTrigger><SelectValue placeholder="Select Yes or No" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        );
      case "select":
        return (
          <Select value={value || ""} onValueChange={(next) => setFieldValue(field.id, next)}>
            <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multi-select":
        return <MultiSelectChecklist options={options} selected={asArray(value)} onChange={(next) => setFieldValue(field.id, next)} />;
      case "textarea":
        return <Textarea rows={4} value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "multi-item-text":
        return <Textarea rows={4} value={asArray(value).join("\n")} onChange={(e) => setFieldValue(field.id, parseList(e.target.value))} placeholder="One item per line" />;
      case "number":
      case "integer":
        return <Input type="number" value={value ?? ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "url":
        return <Input type="url" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "email":
        return <Input type="email" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "phone":
        return (
          <PhoneInput
            value={value || ""}
            onChange={(next) => setFieldValue(field.id, next)}
          />
        );
      case "file":
        return <Input type="file" onChange={(e) => setFieldValue(field.id, e.target.files?.[0] ? `file:${e.target.files[0].name}` : "")} />;
      default:
        return <Input value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
    }
  };

  return (
    <div className="space-y-4">
      {sections.map(([section, fields]) => (
        <Card key={section}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                {field.type !== "boolean" && (
                  <div className="flex items-center gap-1">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.required && <span className="text-destructive font-bold">*</span>}
                  </div>
                )}
                {renderField(field)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90">
            {isSaving ? "Saving..." : "Save Section"}
          </Button>
        </div>
      )}
    </div>
  );
}
