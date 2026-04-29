import * as React from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Save, User, Briefcase, Sparkles,
  Camera, Eye, Layers, Share2, X, Ruler, ClipboardList, Wand2
} from "lucide-react";
import { toast } from "sonner";
import { generateDummyProfileData } from "@/lib/profileAutofill";
import { ProfileSummaryView } from "./ProfileSummaryView";
import { CombinedCurrencyRateInput } from "./fields/CombinedCurrencyRateInput";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsListEditor } from "./fields/CreditsListEditor";
import { PortfolioMediaGallery } from "./fields/PortfolioMediaGallery";
import { MultiSelectChecklist } from "./fields/MultiSelectChecklist";
import {
  UNIFIED_TALENT_PROFILE_FIELD_SPEC,
  UnifiedFieldSpec,
  shouldShowField,
} from "@/lib/unifiedTalentProfile/fieldSpec";
import { getReferenceOptions, COUNTRIES } from "@/lib/unifiedTalentProfile/referenceTables";
import { detectCountry } from "@/lib/locationUtils";

interface UnifiedTalentProfileFormProps {
  rootData: any;
  onChange: (nextRootData: any) => void;
  onSave?: (skipValidation?: boolean) => void;
  isSaving?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showTabs?: boolean;
  pendingProfilePhoto?: any;
  setPendingProfilePhoto?: any;
  pendingPortfolioPhotos?: any[];
  removePendingPortfolioPhoto?: (index: number) => void;
  handlePortfolioSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pendingPortfolioVideos?: { file: File; preview: string; name: string }[];
  removePendingPortfolioVideo?: (index: number) => void;
  handlePortfolioVideoSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pendingIntroVideo?: any;
  setPendingIntroVideo?: any;
  handleIntroVideoSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


const sectionOrder = [
  "Basic Profile",
  "Talent Type",
  "Actor Details",
  "Model Details",
  "Model Measurements",
  "Model Preferences",
  "Singer Details",
  "Dancer Details",
  "Voice Artist Details",
  "Presenter Details",
  "Extra Details",
  "Musician Details",
  "Creator Details",
  "Comedian Details",
  "Stunt Details",
  "Account / Contact",
  "Contact",
  "Emergency Contact",
  "Professional Overview",
  "Representation",
  "Booking Preferences",
  "Availability",
  "Appearance",
  "About You",
  "Media",
  "Social",
  "Actor Profile",
  "Actor Media",
  "Model Profile",
  "Model Media",
  "Singer Profile",
  "Singer Media",
  "Dancer Profile",
  "Dancer Media",
  "Voice Artist Profile",
  "Voice Artist Media",
  "Presenter Profile",
  "Presenter Media",
  "Extra Profile",
  "Musician Profile",
  "Musician Media",
  "Creator Profile",
  "Creator Media",
  "Comedian Profile",
  "Comedian Media",
  "Stunt Profile",
  "Stunt Media",
  "Professional Identity",
  "Business & Facilities",
  "Business Terms",
  "Photography Specialisms",
  "MUA & Hair Specialisms",
  "Coaching Specialisms",
  "Editing Specialisms",
  "Guardian Consent",
];

const normalizeArray = (value: any): string[] => (Array.isArray(value) ? value : []);

const toDisplayValue = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

const parseFreeList = (value: string): string[] =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

// ── Measurement unit helpers ──────────────────────────────────────────────────
type MeasurementUnit = "metric" | "imperial";

// Field IDs that are body measurements (linear, cm <-> inches)
const LINEAR_MEASUREMENT_FIELD_IDS = new Set([
  "chest_bust_measurement",
  "waist_measurement",
  "hip_measurement",
  "inside_leg_measurement",
  "model_chest_bust",
  "model_waist",
  "model_hips",
  "model_inseam",
]);

const HEIGHT_FIELD_IDS = new Set(["height"]);
const WEIGHT_FIELD_IDS = new Set(["weight"]);

// Stored canonical value: cm (for linear), cm (for height), kg (for weight)
// Imperial display: inches for linear; ft/in for height; lbs for weight

function cmToInches(cm: number): number { return Math.round(cm / 2.54 * 10) / 10; }
function inchesToCm(inches: number): number { return Math.round(inches * 2.54 * 10) / 10; }
function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
}
function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * 2.54 * 10) / 10;
}
function kgToLbs(kg: number): number { return Math.round(kg * 2.20462 * 10) / 10; }
function lbsToKg(lbs: number): number { return Math.round(lbs / 2.20462 * 10) / 10; }

// ── MeasurementInput ──────────────────────────────────────────────────────────
interface MeasurementInputProps {
  fieldId: string;
  value: string; // canonical metric value stored (e.g., "175", "70")
  unit: MeasurementUnit;
  onChange: (canonicalValue: string) => void;
  hasError?: boolean;
}

function MeasurementInput({ fieldId, value, unit, onChange, hasError }: MeasurementInputProps) {
  const canonicalNum = parseFloat(value) || 0;

  // HEIGHT field: ft/in dual input in imperial
  if (HEIGHT_FIELD_IDS.has(fieldId)) {
    if (unit === "imperial") {
      const { ft, inches } = cmToFtIn(canonicalNum);
      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              min={0}
              max={9}
              value={canonicalNum > 0 ? ft : ""}
              placeholder="5"
              className={hasError ? "border-destructive" : ""}
              onChange={(e) => {
                const newFt = parseFloat(e.target.value) || 0;
                onChange(String(ftInToCm(newFt, inches)));
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">ft</span>
          </div>
          <div className="relative flex-1">
            <Input
              type="number"
              min={0}
              max={11}
              value={canonicalNum > 0 ? inches : ""}
              placeholder="11"
              className={hasError ? "border-destructive" : ""}
              onChange={(e) => {
                const newIn = parseFloat(e.target.value) || 0;
                onChange(String(ftInToCm(ft, newIn)));
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">in</span>
          </div>
        </div>
      );
    }
    // metric
    return (
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={canonicalNum > 0 ? canonicalNum : ""}
          placeholder="175"
          className={hasError ? "border-destructive" : ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">cm</span>
      </div>
    );
  }

  // WEIGHT field
  if (WEIGHT_FIELD_IDS.has(fieldId)) {
    const displayVal = unit === "imperial" && canonicalNum > 0
      ? kgToLbs(canonicalNum)
      : (canonicalNum > 0 ? canonicalNum : "");
    const unit_label = unit === "imperial" ? "lbs" : "kg";
    return (
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={displayVal}
          placeholder={unit === "imperial" ? "154" : "70"}
          className={hasError ? "border-destructive" : ""}
          onChange={(e) => {
            const n = parseFloat(e.target.value) || 0;
            onChange(unit === "imperial" ? String(lbsToKg(n)) : e.target.value);
          }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">{unit_label}</span>
      </div>
    );
  }

  // LINEAR body measurements (bust, waist, hips, inseam, etc.)
  if (LINEAR_MEASUREMENT_FIELD_IDS.has(fieldId)) {
    const displayVal = unit === "imperial" && canonicalNum > 0
      ? cmToInches(canonicalNum)
      : (canonicalNum > 0 ? canonicalNum : "");
    const unit_label = unit === "imperial" ? "in" : "cm";
    return (
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={displayVal}
          placeholder={unit === "imperial" ? "34" : "86"}
          className={hasError ? "border-destructive" : ""}
          onChange={(e) => {
            const n = parseFloat(e.target.value) || 0;
            onChange(unit === "imperial" ? String(inchesToCm(n)) : e.target.value);
          }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">{unit_label}</span>
      </div>
    );
  }

  // Fallback
  return (
    <Input
      value={value || ""}
      className={hasError ? "border-destructive" : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

const ALL_MEASUREMENT_FIELD_IDS = new Set([
  ...HEIGHT_FIELD_IDS,
  ...WEIGHT_FIELD_IDS,
  ...LINEAR_MEASUREMENT_FIELD_IDS,
]);
// ─────────────────────────────────────────────────────────────────────────────



export function UnifiedTalentProfileForm({
  rootData,
  onChange,
  onSave,
  isSaving = false,
  activeTab: externalActiveTab,
  onTabChange,
  showTabs = true,
  pendingProfilePhoto,
  setPendingProfilePhoto,
  pendingPortfolioPhotos,
  removePendingPortfolioPhoto,
  handlePortfolioSelect,
  pendingPortfolioVideos,
  removePendingPortfolioVideo,
  handlePortfolioVideoSelect,
  pendingIntroVideo,
  setPendingIntroVideo,
  handleIntroVideoSelect
}: UnifiedTalentProfileFormProps) {
  const { user } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = useState("basic");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>("metric");
  const activeTab = externalActiveTab || internalActiveTab;

  const handleAutoFill = () => {
    const activeTabGroup = tabGroups.find(t => t.id === activeTab);
    if (!activeTabGroup) return;

    const dummyData = generateDummyProfileData(UNIFIED_TALENT_PROFILE_FIELD_SPEC);
    
    // Filter dummyData to only include fields from sections in the active tab
    const filteredDummy: Record<string, any> = {};
    UNIFIED_TALENT_PROFILE_FIELD_SPEC.forEach(field => {
      if (activeTabGroup.sections.includes(field.section) && dummyData[field.id] !== undefined) {
        filteredDummy[field.id] = dummyData[field.id];
      }
    });

    // Auto-derive age group if DOB is present and in active tab
    if (filteredDummy.dateOfBirth) {
      const derived = deriveAgeGroupFromDob(filteredDummy.dateOfBirth);
      if (derived) {
        filteredDummy.age_group = derived;
      }
    }

    const nextUnified = { ...unified, ...filteredDummy };
    const nextRoot = { ...rootData, ...filteredDummy, unifiedTalentProfile: nextUnified };
    onChange(nextRoot);
    toast.success(`Form in ${activeTabGroup.label} auto-filled with mock data`);
  };

  const unified = rootData?.unifiedTalentProfile || {};
  const values = { ...rootData, ...unified };

  const deriveAgeGroupFromDob = (dob: string | undefined): string | null => {
    if (!dob) return null;
    const date = new Date(dob);
    if (Number.isNaN(date.getTime())) return null;
    const now = new Date();
    if (date > now) return null;
    const age = now.getFullYear() - date.getFullYear() - (now < new Date(now.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0);
    if (age < 13) return "Under 13";
    if (age <= 15) return "13-15";
    if (age <= 17) return "16-17";
    if (age <= 24) return "18-24";
    if (age <= 34) return "25-34";
    if (age <= 44) return "35-44";
    if (age <= 54) return "45-54";
    return "55+";
  };

  useEffect(() => {
    // Auto-detect and set country if not present, and default booleans to false
    const updates: Record<string, any> = {};

    if (!values.current_country) {
      const detected = detectCountry();
      updates.current_country = detected || "United Kingdom";
    }

    if (!values.nationality) {
      updates.nationality = "United Kingdom";
    }

    if (!values.phone_number) {
      // Default to UK dial code
      updates.phone_number = "+44";
    }

    if (!values.currency) {
      updates.currency = user?.preferredCurrency === "NGN" ? "NGN (₦)" :
        user?.preferredCurrency === "USD" ? "USD ($)" :
          user?.preferredCurrency === "EUR" ? "EUR (€)" : "GBP (£)";
    }

    const derivedAgeGroup = deriveAgeGroupFromDob(values.dateOfBirth);
    if (derivedAgeGroup && values.age_group !== derivedAgeGroup) {
      updates.age_group = derivedAgeGroup;
    }

    if (Object.keys(updates).length > 0) {
      onChange({
        ...rootData,
        unifiedTalentProfile: {
          ...unified,
          ...updates
        }
      });
    }
  }, []);

  const tabGroups = useMemo(() => [
    {
      id: "basic",
      label: "Basic Profile",
      sections: ["Basic Profile", "About You", "Availability", "Contact", "Account / Contact", "Emergency Contact", "Guardian Consent"]
    },
    {
      id: "professional",
      label: "Professional",
      sections: [
        "Talent Type",
        // Metadata / Details
        "Actor Details", "Model Details", "Singer Details", "Dancer Details",
        "Voice Artist Details", "Presenter Details", "Extra Details", "Musician Details",
        "Creator Details", "Comedian Details", "Stunt Details",
        // Specialized Assets (Renamed from Media)
        "Actor Profile", "Model Profile", "Singer Profile", "Dancer Profile",
        "Voice Artist Profile", "Presenter Profile", "Musician Profile", "Creator Profile",
        "Comedian Profile", "Stunt Profile",
        // Professional Specialisms
        "Photography Specialisms", "MUA & Hair Specialisms", "Coaching Specialisms", "Editing Specialisms",
        "Professional Overview", "Representation", "Booking Preferences",
        // Professional Identity & Business
        "Professional Identity", "Business & Facilities", "Business Terms"
      ]
    },
    {
      id: "appearance",
      label: "Appearance",
      sections: ["Appearance", "Model Measurements", "Model Preferences"]
    },
    {
      id: "portfolio",
      label: "Portfolio",
      sections: ["Social", "Media", "Contact / Media"]
    },
    {
      id: "summary",
      label: "Summary",
      sections: []
    }
  ], []);

  const visibleFields = useMemo(
    () => UNIFIED_TALENT_PROFILE_FIELD_SPEC.filter((field) => shouldShowField(field, values)),
    [values]
  );

  const sectionsByTab = useMemo(() => {
    const bucket: Record<string, UnifiedFieldSpec[]> = {};
    for (const field of visibleFields) {
      bucket[field.section] = bucket[field.section] || [];
      bucket[field.section].push(field);
    }

    const result: Record<string, { section: string; fields: UnifiedFieldSpec[] }[]> = {};

    tabGroups.forEach(tab => {
      result[tab.id] = tab.sections
        .map(sectionName => ({
          section: sectionName,
          fields: bucket[sectionName] || []
        }))
        .filter(s => s.fields.length > 0);
    });

    return result;
  }, [visibleFields, tabGroups]);

  const setFieldValue = (fieldId: string, value: any) => {
    // Clear error for this field when changed
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }

    let finalValue = value;
    // Map "Yes"/"No" to true/false for boolean/checkbox types
    const fieldSpec = UNIFIED_TALENT_PROFILE_FIELD_SPEC.find(f => f.id === fieldId);
    if (fieldSpec?.type === "boolean" || fieldSpec?.type === "checkbox" || (fieldSpec?.type === "select" && fieldSpec.options?.includes("Yes") && fieldSpec.options?.includes("No"))) {
      if (value === "Yes") finalValue = true;
      else if (value === "No") finalValue = false;
    }

    let nextUnified = { ...unified, [fieldId]: finalValue };
    let nextRoot = { ...rootData, [fieldId]: finalValue };

    // Special logic: ensure primary and additional talent types are mutually exclusive
    if (fieldId === "primary_talent_type") {
      const currentAdditional = normalizeArray(values.additional_talent_types);
      if (currentAdditional.includes(value)) {
        const nextAdditional = currentAdditional.filter(t => t !== value);
        nextUnified.additional_talent_types = nextAdditional;
        nextRoot.additional_talent_types = nextAdditional;
      }
    }

    // Special logic: Auto update age group when Date of Birth changes
    if (fieldId === "dateOfBirth") {
      const derivedAgeGroup = deriveAgeGroupFromDob(value);
      if (derivedAgeGroup) {
        nextUnified.age_group = derivedAgeGroup;
        nextRoot.age_group = derivedAgeGroup;
      }
    }

    onChange({
      ...nextRoot,
      unifiedTalentProfile: nextUnified,
    });
  };

  const validateTab = (tabId: string) => {
    const tabSections = sectionsByTab[tabId] || [];
    const newErrors: Record<string, string> = {};

    tabSections.forEach(({ fields }) => {
      fields.forEach((field) => {
        if (field.required) {
          const value = values[field.id];
          const isEmpty =
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            newErrors[field.id] = `${field.label} is required.`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabSave = () => {
    if (validateTab(activeTab)) {
      if (onSave) onSave(true);
    } else {
      // Scroll to the first error
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        const element = document.getElementById(`field-${firstErrorId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const getOptions = (field: UnifiedFieldSpec): string[] => {
    if (field.options?.length) return field.options;
    if (field.optionSource) return getReferenceOptions(field.optionSource);
    return [];
  };

  const renderField = (field: UnifiedFieldSpec) => {
    const value = values[field.id];
    let options = getOptions(field);
    const hasError = !!errors[field.id];

    // Filter out primary from additional selection
    if (field.id === "additional_talent_types" && values.primary_talent_type) {
      options = options.filter(opt => opt !== values.primary_talent_type);
    }

    const fieldContent = (() => {
      switch (field.type) {
        case "boolean":
        case "checkbox": {
          const booleanVal = (value === true || value === "Yes") ? "Yes" : (value === false || value === "No" ? "No" : "");
          return (
            <Select
              value={booleanVal}
              onValueChange={(next) => setFieldValue(field.id, next)}
            >
              <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select Yes or No" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          );
        }

        case "select":
          const isBooleanSelect = options.includes("Yes") && options.includes("No");
          const selectValue = isBooleanSelect 
            ? ((value === true || value === "Yes") ? "Yes" : (value === false || value === "No" ? "No" : ""))
            : (value || "");
          return (
            <Select
              value={selectValue}
              onValueChange={(next) => setFieldValue(field.id, next)}
            >
              <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "multi-select":
          return (
            <div className={hasError ? 'border-destructive' : ''}>
              <MultiSelectChecklist
                options={options}
                selected={normalizeArray(value)}
                onChange={(next) => setFieldValue(field.id, next)}
              />
            </div>
          );

        case "textarea":
        case "url-list":
        case "multi-file-or-url":
          return (
            <Textarea
              rows={4}
              value={toDisplayValue(value)}
              className={hasError ? 'border-destructive' : ''}
              onChange={(e) => {
                if (field.type === "url-list" || field.type === "multi-file-or-url") {
                  setFieldValue(field.id, parseFreeList(e.target.value));
                  return;
                }
                setFieldValue(field.id, e.target.value);
              }}
              placeholder={field.type === "url-list" ? "One URL per line" : `Enter ${field.label}`}
            />
          );

        case "file":
          return (
            <Input
              type="file"
              className={hasError ? 'border-destructive' : ''}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFieldValue(field.id, `file:${file.name}`);
              }}
            />
          );

        case "multi-file":
          return (
            <Input
              type="file"
              multiple
              className={hasError ? 'border-destructive' : ''}
              onChange={(e) => {
                const names = Array.from(e.target.files || []).map((file) => file.name);
                setFieldValue(field.id, names);
              }}
            />
          );

        case "file-or-url":
          return (
            <div className="space-y-2">
              <Input
                value={typeof value === "string" ? value : ""}
                className={hasError ? 'border-destructive' : ''}
                onChange={(e) => setFieldValue(field.id, e.target.value)}
                placeholder="Paste URL"
              />
              <Input
                type="file"
                className={hasError ? 'border-destructive' : ''}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFieldValue(field.id, `file:${file.name}`);
                }}
              />
            </div>
          );

        case "date": {
          let dateValue = value || "";
          if (dateValue && typeof dateValue === "string" && dateValue.includes("T")) {
            dateValue = dateValue.split("T")[0];
          }
          return <Input type="date" value={dateValue} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
        }

        case "email":
          return (
            <Input
              type="email"
              value={value || ""}
              className={hasError ? 'border-destructive' : ''}
              disabled={field.id === "email"}
              onChange={(e) => setFieldValue(field.id, e.target.value)}
            />
          );

        case "phone":
          return (
            <PhoneInput
              value={value || ""}
              onChange={(next) => setFieldValue(field.id, next)}
              className={hasError ? 'border-destructive' : ''}
            />
          );

        case "number":
          return <Input type="number" value={value || ""} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

        case "url":
          return <Input type="url" value={value || ""} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

        case "credits-list":
          return <CreditsListEditor label={field.label} value={value} onChange={(next) => setFieldValue(field.id, next)} />;

        default:
          if (ALL_MEASUREMENT_FIELD_IDS.has(field.id)) {
            return (
              <MeasurementInput
                fieldId={field.id}
                value={String(value || "")}
                unit={measurementUnit}
                onChange={(v) => setFieldValue(field.id, v)}
                hasError={hasError}
              />
            );
          }
          return <Input value={value || ""} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
      }
    })();

    return (
      <div id={`field-${field.id}`} className="space-y-1">
        {fieldContent}
        {hasError && (
          <p className="text-[10px] font-medium text-destructive">{errors[field.id]}</p>
        )}
      </div>
    );
  };

  const renderTabContent = (tabId: string) => {
    if (tabId === "summary") {
      return (
        <ProfileSummaryView
          fields={UNIFIED_TALENT_PROFILE_FIELD_SPEC}
          values={values}
          title="Profile Overview"
        />
      );
    }

    const sections = sectionsByTab[tabId] || [];
    if (sections.length === 0) return null;

    const isAppearanceTab = tabId === "appearance";

    return (
      <div className="space-y-10">
        {/* ── Metric / Imperial toggle (Appearance tab only) ── */}
        {isAppearanceTab && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#009698]/20 bg-gradient-to-r from-[#009698]/5 to-[#006b6d]/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#009698]/10 flex items-center justify-center flex-shrink-0">
                <Ruler className="w-4 h-4 text-[#009698]" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Measurement System</p>
                <p className="text-xs text-muted-foreground">Choose how you enter your physical measurements</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border shadow-sm flex-shrink-0">
              <button
                type="button"
                onClick={() => setMeasurementUnit("metric")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${measurementUnit === "metric"
                  ? "bg-[#009698] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Metric
                <span className="ml-1 opacity-70 font-normal">(cm / kg)</span>
              </button>
              <button
                type="button"
                onClick={() => setMeasurementUnit("imperial")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${measurementUnit === "imperial"
                  ? "bg-[#009698] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Imperial
                <span className="ml-1 opacity-70 font-normal">(ft·in / lbs)</span>
              </button>
            </div>
          </div>
        )}

        {sections.map(({ section, fields }) => (
          <Card key={section} className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4 border-b mb-6">
              <CardTitle className="text-xl font-bold tracking-tight text-[#006b6d]">{section}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Specific details for your profile in this category.</p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fields.reduce((acc: JSX.Element[], field, idx, arr) => {
                  // Skip if this field was already handled as part of a group (expected_rate_range follows currency)
                  if (field.id === 'expected_rate_range' && arr[idx - 1]?.id === 'currency') return acc;

                  const isCurrencyGroup = field.id === 'currency' && arr[idx + 1]?.id === 'expected_rate_range';

                  if (isCurrencyGroup) {
                    acc.push(
                      <div key="currency-rate-group" className="md:col-span-2 space-y-2">
                        <div className="flex items-center gap-1">
                          <label className="text-sm font-semibold text-foreground/70">Expected Rate / Fee Range</label>
                          {(field.required || arr[idx + 1].required) && <span className="text-destructive font-bold">*</span>}
                        </div>
                        <CombinedCurrencyRateInput
                          currencyValue={values.currency}
                          rateValue={values.expected_rate_range}
                          onCurrencyChange={(v) => setFieldValue('currency', v)}
                          onRateChange={(v) => setFieldValue('expected_rate_range', v)}
                          currencyOptions={getOptions(field)}
                          rateOptions={getOptions(arr[idx + 1])}
                          errors={errors}
                        />
                      </div>
                    );
                  } else {
                    acc.push(
                      <div
                        key={field.id}
                        id={`field-${field.id}`}
                        data-testid={`field-${field.id}`}
                        className={`space-y-2 ${field.type === 'credits-list' ? 'md:col-span-2' : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          <label className="text-sm font-semibold text-foreground/70">{field.label}</label>
                          {field.required && <span className="text-destructive font-bold">*</span>}
                        </div>
                        <div className="transition-all duration-200 focus-within:ring-2 focus-within:ring-[#009698]/20 focus-within:ring-offset-2 rounded-md">
                          {renderField(field)}
                        </div>
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
          <div className="flex justify-end pt-8 border-t">
            <Button
              size="lg"
              onClick={handleTabSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-[#009698] hover:bg-[#009698]/90 font-bold px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Section
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const tabIcons: Record<string, any> = {
    basic: User,
    professional: Briefcase,
    specialisms: Sparkles,
    appearance: Eye,
    portfolio: Share2,
    summary: ClipboardList
  };

  if (!showTabs) {
    return (
      <div className="space-y-10">
        {activeTab === 'portfolio' && (
          <PortfolioMediaGallery
            profileData={rootData}
            setProfileData={onChange}
            pendingProfilePhoto={pendingProfilePhoto}
            setPendingProfilePhoto={setPendingProfilePhoto}
            pendingPortfolioPhotos={pendingPortfolioPhotos || []}
            removePendingPortfolioPhoto={removePendingPortfolioPhoto!}
            handlePortfolioSelect={handlePortfolioSelect!}
            pendingPortfolioVideos={pendingPortfolioVideos || []}
            removePendingPortfolioVideo={removePendingPortfolioVideo!}
            handlePortfolioVideoSelect={handlePortfolioVideoSelect!}
            pendingIntroVideo={pendingIntroVideo}
            setPendingIntroVideo={setPendingIntroVideo}
            handleIntroVideoSelect={handleIntroVideoSelect!}
            handleSave={onSave || (() => { })}
            isSaving={isSaving}
          />
        )}
        {renderTabContent(activeTab as string)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setInternalActiveTab(value);
          if (onTabChange) onTabChange(value);
        }}
        className="w-full"
      >
        <TabsList className="sticky top-0 z-10 h-14 w-full justify-start overflow-x-auto bg-white/80 backdrop-blur-md border shadow-sm gap-2 p-1.5 rounded-2xl scrollbar-hide mb-6">
          {tabGroups.map(tab => {
            const hasFields = sectionsByTab[tab.id]?.length > 0;
            if (!hasFields && tab.id !== 'portfolio' && tab.id !== 'summary') return null;
            const Icon = tabIcons[tab.id] || Sparkles;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-6 h-full rounded-xl transition-all duration-300 data-[state=active]:bg-[#009698] data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Icon className="w-4 h-4" />
                <span className="font-bold text-sm whitespace-nowrap">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          {tabGroups.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="rounded-[2rem] border shadow-card overflow-hidden">
                <CardContent className="p-8 md:p-12 space-y-10">
                  {tab.id === 'portfolio' && (
                    <PortfolioMediaGallery
                      profileData={rootData}
                      setProfileData={onChange}
                      pendingProfilePhoto={pendingProfilePhoto}
                      setPendingProfilePhoto={setPendingProfilePhoto}
                      pendingPortfolioPhotos={pendingPortfolioPhotos || []}
                      removePendingPortfolioPhoto={removePendingPortfolioPhoto!}
                      handlePortfolioSelect={handlePortfolioSelect!}
                      pendingPortfolioVideos={pendingPortfolioVideos || []}
                      removePendingPortfolioVideo={removePendingPortfolioVideo!}
                      handlePortfolioVideoSelect={handlePortfolioVideoSelect!}
                      pendingIntroVideo={pendingIntroVideo}
                      setPendingIntroVideo={setPendingIntroVideo}
                      handleIntroVideoSelect={handleIntroVideoSelect!}
                      handleSave={onSave || (() => { })}
                      isSaving={isSaving}
                    />
                  )}
                  {renderTabContent(tab.id)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
