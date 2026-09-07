import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, Save, Loader2, Eye, Sparkles } from "lucide-react";

interface SummaryField {
  id: string;
  label: string;
  section: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface ProfileSummaryViewProps {
  fields: SummaryField[];
  values: Record<string, any>;
  title?: string;
  onFieldValueChange?: (fieldId: string, value: any) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isEditable?: boolean;
}

const COMMON_FIELD_OPTIONS: Record<string, string[]> = {
  gender: ["Female", "Male", "Non-binary", "Prefer to self-describe", "Prefer not to say"],
  age_group: ["Under 13", "13-15", "16-17", "18-24", "25-34", "35-44", "45-54", "55+"],
  right_to_work: ["Yes", "No"],
  valid_passport: ["Yes", "No"],
  willing_to_travel: ["Yes", "No"],
  international_availability: ["Yes", "No"],
  remote_work_open: ["Yes", "No"],
  open_to_unpaid: ["Yes", "No"],
  representation_status: ["Self-represented", "Represented by agency", "Managed by agent"],
  years_of_experience: ["No experience yet", "<1 year", "1-2 years", "3-5 years", "5+ years", "10+ years"],
  experience_level: ["Beginner", "Intermediate", "Professional", "Expert"],
  availability_type: ["Full-time", "Part-time", "Freelance / Project-based", "Casual / Event-based"],
};

export function ProfileSummaryView({
  fields,
  values,
  title,
  onFieldValueChange,
  onSave,
  isSaving = false,
  isEditable = true,
}: ProfileSummaryViewProps) {
  const [isAllEditing, setIsAllEditing] = React.useState(false);
  const [editingSections, setEditingSections] = React.useState<Record<string, boolean>>({});

  const toggleSectionEdit = (section: string) => {
    setEditingSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getValue = React.useCallback((fieldId: string) => {
    if (values[fieldId] !== undefined && values[fieldId] !== null && values[fieldId] !== "") {
      return values[fieldId];
    }
    const camelId = fieldId.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (values[camelId] !== undefined && values[camelId] !== null && values[camelId] !== "") {
      return values[camelId];
    }
    const snakeId = fieldId.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (values[snakeId] !== undefined && values[snakeId] !== null && values[snakeId] !== "") {
      return values[snakeId];
    }

    const nestedGroups = ["appearance", "emergencyContact", "guardianConsent", "talentProfile", "professionalProfile", "castingDirectorProfile", "talent", "professional"];
    for (const group of nestedGroups) {
      const groupObj = values[group];
      if (groupObj && typeof groupObj === "object") {
        const parts = fieldId.split("_");
        const suffix = parts.length > 1 ? parts.slice(1).join("_") : fieldId;
        const suffixCamel = suffix.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        
        if (groupObj[suffix] !== undefined && groupObj[suffix] !== null && groupObj[suffix] !== "") return groupObj[suffix];
        if (groupObj[suffixCamel] !== undefined && groupObj[suffixCamel] !== null && groupObj[suffixCamel] !== "") return groupObj[suffixCamel];
        if (groupObj[fieldId] !== undefined && groupObj[fieldId] !== null && groupObj[fieldId] !== "") return groupObj[fieldId];
        if (groupObj[camelId] !== undefined && groupObj[camelId] !== null && groupObj[camelId] !== "") return groupObj[camelId];
      }
    }

    if (fieldId === "display_name" && values.stageName) return values.stageName;
    if (fieldId === "short_bio" && values.bio) return values.bio;
    if (fieldId === "full_bio" && values.fullAbout) return values.fullAbout;
    if (fieldId === "phone_number" && values.phone) return values.phone;

    return "";
  }, [values]);

  const handleValueChange = (fieldId: string, val: any) => {
    if (onFieldValueChange) {
      onFieldValueChange(fieldId, val);
    }
  };

  const sections = React.useMemo(() => {
    const grouped: Record<string, SummaryField[]> = {};
    fields.forEach((field) => {
      grouped[field.section] = grouped[field.section] || [];
      grouped[field.section].push(field);
    });
    return Object.entries(grouped);
  }, [fields]);

  const renderEditableInput = (field: SummaryField) => {
    const rawVal = getValue(field.id);
    const options = field.options || COMMON_FIELD_OPTIONS[field.id];

    if (options && options.length > 0) {
      return (
        <select
          value={String(rawVal || "")}
          onChange={(e) => handleValueChange(field.id, e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-input bg-background font-medium text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#009698] shadow-xs"
        >
          <option value="">-- Select {field.label} --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "boolean" || field.type === "checkbox") {
      const boolVal = rawVal === "Yes" || rawVal === true;
      return (
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant={boolVal ? "default" : "outline"}
            onClick={() => handleValueChange(field.id, "Yes")}
            className={`h-8 text-xs font-bold ${boolVal ? "bg-[#009698] hover:bg-[#009698]/90 text-white" : ""}`}
          >
            Yes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!boolVal && rawVal !== "" ? "default" : "outline"}
            onClick={() => handleValueChange(field.id, "No")}
            className={`h-8 text-xs font-bold ${!boolVal && rawVal !== "" ? "bg-slate-700 text-white" : ""}`}
          >
            No
          </Button>
        </div>
      );
    }

    if (field.type === "date") {
      let dVal = typeof rawVal === "string" ? rawVal : "";
      if (dVal.includes("T")) dVal = dVal.split("T")[0];
      return (
        <Input
          type="date"
          value={dVal}
          onChange={(e) => handleValueChange(field.id, e.target.value)}
          className="h-10 rounded-xl font-medium text-sm focus:ring-[#009698]"
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={String(rawVal || "")}
          onChange={(e) => handleValueChange(field.id, e.target.value)}
          rows={3}
          className="rounded-xl font-medium text-sm focus:ring-[#009698]"
          placeholder={`Enter ${field.label}...`}
        />
      );
    }

    return (
      <Input
        type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
        value={String(rawVal || "")}
        onChange={(e) => handleValueChange(field.id, e.target.value)}
        className="h-10 rounded-xl font-medium text-sm focus:ring-[#009698]"
        placeholder={`Enter ${field.label}...`}
      />
    );
  };

  const renderDisplayValue = (field: SummaryField) => {
    const value = getValue(field.id);
    if (value === null || value === undefined || value === "") return <span className="text-muted-foreground/60 italic text-xs">Not provided</span>;
    
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
      const isYes = value === "Yes" || value === true;
      return <Badge variant={isYes ? "default" : "outline"} className={isYes ? "bg-[#009698]" : ""}>{isYes ? "Yes" : "No"}</Badge>;
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 pb-2 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title || "Profile Overview"}</h2>
          {isEditable && (
            <Badge variant="outline" className="bg-[#009698]/10 text-[#009698] border-[#009698]/20 text-xs font-semibold px-2.5 py-0.5">
              <Sparkles className="w-3 h-3 mr-1 text-[#009698]" /> Editable
            </Badge>
          )}
        </div>

        {isEditable && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant={isAllEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAllEditing(!isAllEditing)}
              className={isAllEditing ? "bg-[#009698] hover:bg-[#009698]/90 text-white font-semibold rounded-xl" : "border-[#009698]/30 text-[#009698] hover:bg-[#009698]/10 font-semibold rounded-xl"}
            >
              {isAllEditing ? (
                <>
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Summary
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Edit All Fields
                </>
              )}
            </Button>
            {onSave && (
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl shadow-md px-5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sections.map(([section, sectionFields]) => {
          const isSectionEditing = isAllEditing || !!editingSections[section];

          return (
            <Card key={section} className="border-none shadow-card bg-white overflow-hidden rounded-3xl ring-1 ring-gray-200">
              <CardHeader className="bg-gray-50/70 px-6 py-4 flex flex-row items-center justify-between space-y-0 border-b border-gray-100">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#006b6d]">
                  {section}
                </CardTitle>
                {isEditable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionEdit(section)}
                    className="h-8 text-xs font-semibold text-[#009698] hover:text-[#006b6d] hover:bg-[#009698]/10 rounded-lg"
                  >
                    {isSectionEditing ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Done
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit Section
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {sectionFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-destructive font-bold">*</span>}
                      </p>
                      {isSectionEditing ? (
                        renderEditableInput(field)
                      ) : (
                        <div className="text-sm font-medium">
                          {renderDisplayValue(field)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isSectionEditing && onSave && (
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        toggleSectionEdit(section);
                        onSave();
                      }}
                      disabled={isSaving}
                      className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold text-xs px-5 rounded-xl shadow-xs"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          Save Section
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isEditable && onSave && (
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            size="lg"
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold text-base px-10 py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.01]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save All Profile Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
