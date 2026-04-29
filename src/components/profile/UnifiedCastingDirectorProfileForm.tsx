import { useMemo, useState, useEffect } from "react";
import { detectCountry } from "@/lib/locationUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateDummyProfileData } from "@/lib/profileAutofill";
import {
  castingDirectorSectionTabMap,
  CastingDirectorFieldSpec,
  shouldShowCastingDirectorField,
  UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC,
} from "@/lib/unifiedCastingDirectorProfile/fieldSpec";
import { getCastingDirectorReferenceOptions } from "@/lib/unifiedCastingDirectorProfile/referenceTables";
import { MultiSelectChecklist } from "./fields/MultiSelectChecklist";
import { CombinedCurrencyRateInput } from "./fields/CombinedCurrencyRateInput";

type CastingProfileTab = "overview" | "hiring" | "projects" | "roles" | "audition" | "commercial" | "navigation";

interface UnifiedCastingDirectorProfileFormProps {
  rootData: any;
  onChange: (nextRootData: any) => void;
  onSave?: (skipValidation?: boolean) => void;
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
];

const asArray = (value: any): string[] => (Array.isArray(value) ? value.map(String) : []);
const parseList = (value: string): string[] => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);



export function UnifiedCastingDirectorProfileForm({ rootData, onChange, onSave, isSaving = false, activeTab }: UnifiedCastingDirectorProfileFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const unified = rootData?.unifiedCastingDirectorProfile || {};
  const values = { ...rootData, ...unified };

  const handleAutoFill = () => {
    const dummyData = generateDummyProfileData(
      UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC,
      getCastingDirectorReferenceOptions
    );
    const nextUnified = { ...unified, ...dummyData };
    const nextRoot = { ...rootData, ...dummyData, unifiedCastingDirectorProfile: nextUnified };
    onChange(nextRoot);
    toast.success("Casting Director form auto-filled with mock data");
  };
  
  useEffect(() => {
    const updates: Record<string, any> = {};
    if (!values.current_country) {
      updates.current_country = detectCountry();
    }
    if (!values.phone_number) {
      updates.phone_number = "+44";
    }
    if (!values.currency) {
      updates.currency = user?.preferredCurrency === "NGN" ? "NGN (₦)" : 
                        user?.preferredCurrency === "USD" ? "USD ($)" :
                        user?.preferredCurrency === "EUR" ? "EUR (€)" : "GBP (£)";
    }
    
    if (Object.keys(updates).length > 0) {
      onChange({
        ...rootData,
        unifiedCastingDirectorProfile: {
          ...unified,
          ...updates
        }
      });
    }
  }, []);

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
    let finalValue = value;
    // Map "Yes"/"No" to true/false for boolean types or selects with Yes/No options
    const fieldSpec = UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC.find(f => f.id === fieldId);
    if (fieldSpec?.type === "boolean" || (fieldSpec?.type === "select" && fieldSpec.options?.includes("Yes") && fieldSpec.options?.includes("No"))) {
      if (value === "Yes") finalValue = true;
      else if (value === "No") finalValue = false;
    }

    onChange({
      ...rootData,
      [fieldId]: finalValue,
      unifiedCastingDirectorProfile: {
        ...unified,
        [fieldId]: finalValue,
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
            value={value === true ? "Yes" : value === false ? "No" : ""} 
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
        const isBooleanSelect = options.includes("Yes") && options.includes("No");
        return (
          <Select 
            value={isBooleanSelect ? (value === true ? "Yes" : value === false ? "No" : "") : (value || "")} 
            onValueChange={(next) => setFieldValue(field.id, next)}
          >
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoFill}
          className="flex items-center gap-2 border-[#009698] text-[#009698] hover:bg-[#009698]/10 rounded-xl"
        >
          <Wand2 className="w-4 h-4" />
          Auto-fill Mock Data
        </Button>
      </div>
      <div className="space-y-10">
      {sections.map(([section, fields]) => (
        <Card key={section}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {fields.reduce((acc: JSX.Element[], field, idx, arr) => {
                // Skip if this field was already handled as part of a group
                if (field.id === 'currency' && arr[idx-1]?.id === 'payment_amount') return acc;
                
                const isPriceGroup = field.id === 'payment_amount' && arr[idx+1]?.id === 'currency';
                
                if (isPriceGroup) {
                  acc.push(
                    <div key="price-currency-group" className="md:col-span-2 space-y-2">
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium">Payment Amount & Currency</label>
                        {(field.required || arr[idx+1].required) && <span className="text-destructive font-bold">*</span>}
                      </div>
                      <CombinedCurrencyRateInput 
                        currencyValue={values.currency}
                        rateValue={values.payment_amount}
                        onCurrencyChange={(v) => setFieldValue('currency', v)}
                        onRateChange={(v) => setFieldValue('payment_amount', v)}
                        currencyOptions={optionsFor(arr[idx+1])}
                        rateOptions={[]} 
                        errors={{}}
                      />
                    </div>
                  );
                } else {
                  acc.push(
                    <div key={field.id} className={`space-y-2 ${field.type === 'textarea' || field.type === 'multi-select' ? 'md:col-span-2' : ''}`}>
                      {field.type !== "boolean" && (
                        <div className="flex items-center gap-1">
                          <label className="text-sm font-medium">{field.label}</label>
                          {field.required && <span className="text-destructive font-bold">*</span>}
                        </div>
                      )}
                      {renderField(field)}
                    </div>
                  );
                }
                return acc;
              }, [])}
            </div>
          </CardContent>
        </Card>
      ))}
      </div>

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={() => onSave(true)} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90">
            {isSaving ? "Saving..." : "Save Section"}
          </Button>
        </div>
      )}
    </div>
  );
}
