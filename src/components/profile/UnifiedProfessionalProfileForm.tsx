import { useMemo, useState, useEffect } from "react";
import { detectCountry } from "@/lib/locationUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Save, Wand2 } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateDummyProfileData } from "@/lib/profileAutofill";
import {
  ProfessionalFieldSpec,
  sectionToTabMap,
  shouldShowProfessionalField,
  UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC,
} from "@/lib/unifiedProfessionalProfile/fieldSpec";
import { getProfessionalReferenceOptions } from "@/lib/unifiedProfessionalProfile/referenceTables";
import { MultiSelectChecklist } from "./fields/MultiSelectChecklist";
import { CombinedCurrencyRateInput } from "./fields/CombinedCurrencyRateInput";

type FormTab = "general" | "professional" | "business" | "media";

interface UnifiedProfessionalProfileFormProps {
  rootData: any;
  onChange: (nextRootData: any) => void;
  onSave?: (skipValidation?: boolean) => void;
  isSaving?: boolean;
  activeTab?: FormTab;
  showTabs?: boolean;
}

const sectionOrder = [
  "Basic Info", "About", "Contact", "Location", "Location / Availability", "Professional Overview", "Professional Identity", "Professional Focus", "Skills", "Skills / Tools", "Availability", "Booking Terms", "Credibility", "Credibility / Facilities", "Portfolio", "Social", "Reviews", "Service Listing", "Deliverables", "Portfolio Item", "Media", "System", "Photographer Profile", "Makeup Artist Profile", "Acting Coach Profile", "Editor Profile",
];

const normalizeArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

const parseList = (value: string): string[] =>
  value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);



export function UnifiedProfessionalProfileForm({
  rootData,
  onChange,
  onSave,
  isSaving = false,
  activeTab,
  showTabs = false,
}: UnifiedProfessionalProfileFormProps) {
  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const unified = rootData?.unifiedProfessionalProfile || {};
  const values = { ...rootData, ...unified };

  const handleAutoFill = () => {
    const dummyData = generateDummyProfileData(
      UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC,
      getProfessionalReferenceOptions
    );
    const nextUnified = { ...unified, ...dummyData };
    const nextRoot = { ...rootData, ...dummyData, unifiedProfessionalProfile: nextUnified };
    onChange(nextRoot);
    toast.success("Professional form auto-filled with mock data");
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
        unifiedProfessionalProfile: {
          ...unified,
          ...updates
        }
      });
    }
  }, []);

  const visibleFields = useMemo(() => {
    const base = UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC.filter((field) => shouldShowProfessionalField(field, values));
    if (!activeTab) return base;
    return base.filter((field) => (sectionToTabMap[field.section] || "business") === activeTab);
  }, [values, activeTab]);

  const sections = useMemo(() => {
    const grouped: Record<string, ProfessionalFieldSpec[]> = {};
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
      unifiedProfessionalProfile: {
        ...unified,
        [fieldId]: value,
      },
    });
  };

  const getOptions = (field: ProfessionalFieldSpec): string[] => {
    if (field.options?.length) return field.options;
    if (field.optionSource) return getProfessionalReferenceOptions(field.optionSource);

    if (field.id === "core_skills") {
      const base = new Set<string>();
      normalizeArray(values.additional_professional_types).forEach((x) => base.add(x));
      if (values.primary_professional_type) base.add(values.primary_professional_type);
      return Array.from(base);
    }

    if (field.id === "related_service_ids") {
      return normalizeArray(values.service_ids || values.related_service_ids || []);
    }

    return [];
  };

  const renderField = (field: ProfessionalFieldSpec) => {
    const value = values[field.id];
    const options = getOptions(field);

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
        return <MultiSelectChecklist options={options} selected={normalizeArray(value)} onChange={(next) => setFieldValue(field.id, next)} />;
      case "textarea":
        return <Textarea rows={4} value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} placeholder={`Enter ${field.label}`} />;
      case "multi-item-text":
        return <Textarea rows={4} value={normalizeArray(value).join("\n")} onChange={(e) => setFieldValue(field.id, parseList(e.target.value))} placeholder="One item per line" />;
      case "number":
      case "integer":
      case "decimal":
        return <Input type="number" value={value ?? ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "email":
        return <Input type="email" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "phone":
        return (
          <PhoneInput
            value={value || ""}
            onChange={(next) => setFieldValue(field.id, next)}
          />
        );
      case "url":
        return <Input type="url" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      case "file":
      case "file-reference":
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
      {showTabs && (
        <Card>
          <CardHeader>
            <CardTitle>Castglo Industry Professional Profile</CardTitle>
            <p className="text-sm text-muted-foreground">All field groups are generated from the developer-ready field specification.</p>
          </CardHeader>
        </Card>
      )}

      {sections.map(([section, fields]) => (
        <Card key={section}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {fields.reduce((acc: JSX.Element[], field, idx, arr) => {
                // Skip if this field was already handled as part of a group
                if (field.id === 'currency' && arr[idx-1]?.id === 'price_amount') return acc;
                
                const isPriceGroup = field.id === 'price_amount' && arr[idx+1]?.id === 'currency';
                
                if (isPriceGroup) {
                  acc.push(
                    <div key="price-currency-group" className="md:col-span-2 space-y-2">
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium">Pricing & Currency</label>
                        {(field.required || arr[idx+1].required) && <span className="text-destructive font-bold">*</span>}
                      </div>
                      <CombinedCurrencyRateInput 
                        currencyValue={values.currency}
                        rateValue={values.price_amount}
                        onCurrencyChange={(v) => setFieldValue('currency', v)}
                        onRateChange={(v) => setFieldValue('price_amount', v)}
                        currencyOptions={getOptions(arr[idx+1])}
                        rateOptions={[]} // Pass empty to allow free number input
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

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={() => onSave(true)} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90">
            {isSaving ? "Saving..." : "Save This Section"}
          </Button>
        </div>
      )}
    </div>
  );
}
