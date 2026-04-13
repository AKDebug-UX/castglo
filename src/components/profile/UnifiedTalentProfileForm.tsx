import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Save, User, Briefcase, Sparkles, 
  Camera, Eye, Layers, Share2 
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  UNIFIED_TALENT_PROFILE_FIELD_SPEC,
  UnifiedFieldSpec,
  shouldShowField,
} from "@/lib/unifiedTalentProfile/fieldSpec";
import { getReferenceOptions, COUNTRIES } from "@/lib/unifiedTalentProfile/referenceTables";

interface UnifiedTalentProfileFormProps {
  rootData: any;
  onChange: (nextRootData: any) => void;
  onSave?: (skipValidation?: boolean) => void;
  isSaving?: boolean;
  activeTab?: string;
  showTabs?: boolean;
}

const countryToTimeZoneHint: Record<string, string[]> = {
  "Nigeria": ["Africa/Lagos"],
  "United Kingdom": ["Europe/London", "GMT"],
  "United States": ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"],
  "Canada": ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns"],
  "South Africa": ["Africa/Johannesburg"],
  "Ghana": ["Africa/Accra"],
  "Kenya": ["Africa/Nairobi"],
  "Uganda": ["Africa/Kampala"],
  "Rwanda": ["Africa/Kigali"],
  "Tanzania": ["Africa/Dar_es_Salaam"],
  "Ethiopia": ["Africa/Addis_Ababa"],
  "Egypt": ["Africa/Cairo"],
  "Morocco": ["Africa/Casablanca"],
  "Algeria": ["Africa/Algiers"],
  "Tunisia": ["Africa/Tunis"],
  "Cameroon": ["Africa/Douala"],
  "Senegal": ["Africa/Dakar"],
  "Ivory Coast": ["Africa/Abidjan"],
  "France": ["Europe/Paris"],
  "Germany": ["Europe/Berlin"],
  "Netherlands": ["Europe/Amsterdam"],
  "Belgium": ["Europe/Brussels"],
  "Spain": ["Europe/Madrid"],
  "Portugal": ["Europe/Lisbon"],
  "Italy": ["Europe/Rome"],
  "Sweden": ["Europe/Stockholm"],
  "Norway": ["Europe/Oslo"],
  "Denmark": ["Europe/Copenhagen"],
  "Finland": ["Europe/Helsinki"],
  "Poland": ["Europe/Warsaw"],
  "Romania": ["Europe/Bucharest"],
  "Ukraine": ["Europe/Kiev"],
  "Turkey": ["Europe/Istanbul"],
  "Greece": ["Europe/Athens"],
  "Ireland": ["Europe/Dublin"],
  "Scotland": ["Europe/London"], // Close enough
  "Wales": ["Europe/London"], // Close enough
  "India": ["Asia/Kolkata"],
  "Pakistan": ["Asia/Karachi"],
  "Bangladesh": ["Asia/Dhaka"],
  "Sri Lanka": ["Asia/Colombo"],
  "Nepal": ["Asia/Kathmandu"],
  "China": ["Asia/Shanghai", "Asia/Chongqing", "Asia/Harbin", "Asia/Urumqi"],
  "Japan": ["Asia/Tokyo"],
  "South Korea": ["Asia/Seoul"],
  "Indonesia": ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"],
  "Malaysia": ["Asia/Kuala_Lumpur"],
  "Singapore": ["Asia/Singapore"],
  "Philippines": ["Asia/Manila"],
  "Thailand": ["Asia/Bangkok"],
  "Vietnam": ["Asia/Ho_Chi_Minh"],
  "Australia": ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth", "Australia/Adelaide", "Australia/Darwin", "Australia/Hobart"],
  "New Zealand": ["Pacific/Auckland"],
  "Brazil": ["America/Sao_Paulo", "America/Manaus", "America/Belem", "America/Fortaleza"],
  "Mexico": ["America/Mexico_City", "America/Monterrey", "America/Tijuana"],
  "Argentina": ["America/Argentina/Buenos_Aires"],
  "Jamaica": ["America/Jamaica"],
  "Trinidad and Tobago": ["America/Port_of_Spain"],
  "United Arab Emirates": ["Asia/Dubai"],
  "Saudi Arabia": ["Asia/Riyadh"],
  "Qatar": ["Asia/Qatar"],
  "Israel": ["Asia/Jerusalem"],
  "Russia": ["Europe/Moscow", "Asia/Yekaterinburg", "Asia/Novosibirsk", "Asia/Vladivostok"],
};

function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const [country, tzs] of Object.entries(countryToTimeZoneHint)) {
      if (tzs.includes(tz)) return country;
    }
    
    // Fallback to language
    const lang = navigator.language.split('-')[1];
    if (lang === 'NG') return "Nigeria";
    if (lang === 'GB') return "United Kingdom";
    if (lang === 'US') return "United States";
    // ... add more common fallbacks if needed
  } catch (e) {}
  return null;
}

const sectionOrder = [
  "Basic Profile",
  "Account / Contact",
  "Contact",
  "Talent Type",
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
  "Model Measurements",
  "Model Preferences",
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

function MultiSelectChecklist({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="space-y-2">
      {options.length > 12 && (
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search options..." />
      )}
      <div className="max-h-52 overflow-auto border rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((option) => {
          const checked = selected.includes(option);
          return (
            <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={checked}
                onCheckedChange={(isChecked) => {
                  if (isChecked) {
                    onChange([...selected, option]);
                    return;
                  }
                  onChange(selected.filter((item) => item !== option));
                }}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function UnifiedTalentProfileForm({ 
  rootData, 
  onChange, 
  onSave,
  isSaving = false,
  activeTab: externalActiveTab,
  showTabs = true 
}: UnifiedTalentProfileFormProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("basic");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const activeTab = externalActiveTab || internalActiveTab;

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
      if (detected) updates.current_country = detected;
    }

    if (values.right_to_work === undefined) updates.right_to_work = false;
    if (values.valid_passport === undefined) updates.valid_passport = false;

    const derivedAgeGroup = deriveAgeGroupFromDob(values.date_of_birth);
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
      sections: ["Basic Profile", "About You", "Availability", "Contact", "Account / Contact", "Guardian Consent"]
    },
    {
      id: "professional",
      label: "Professional",
      sections: [
        "Talent Type", 
        "Actor Media", "Model Media", "Singer Media", "Dancer Media",
        "Voice Artist Media", "Presenter Media", "Musician Media", "Creator Media",
        "Comedian Media", "Stunt Media",
        "Professional Overview", "Representation", "Booking Preferences"
      ]
    },
    {
      id: "specialisms",
      label: "Specialisms",
      sections: [
        "Actor Profile", "Model Profile", "Model Measurements", "Model Preferences",
        "Singer Profile", "Dancer Profile", "Voice Artist Profile", "Presenter Profile",
        "Extra Profile", "Musician Profile", "Creator Profile", "Comedian Profile",
        "Stunt Profile", "Professional Identity", "Business & Facilities", "Business Terms",
        "Photography Specialisms", "MUA & Hair Specialisms", "Coaching Specialisms", "Editing Specialisms"
      ]
    },
    {
      id: "appearance",
      label: "Appearance",
      sections: ["Appearance"]
    },
    {
      id: "portfolio",
      label: "Portfolio",
      sections: ["Media", "Social"]
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

    let nextUnified = { ...unified, [fieldId]: value };
    let nextRoot = { ...rootData, [fieldId]: value };

    // Special logic: ensure primary and additional talent types are mutually exclusive
    if (fieldId === "primary_talent_type") {
      const currentAdditional = normalizeArray(values.additional_talent_types);
      if (currentAdditional.includes(value)) {
        const nextAdditional = currentAdditional.filter(t => t !== value);
        nextUnified.additional_talent_types = nextAdditional;
        nextRoot.additional_talent_types = nextAdditional;
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
        case "checkbox":
          return (
            <div className={`flex items-center gap-2 rounded-md border p-3 ${hasError ? 'border-destructive bg-destructive/5' : ''}`}>
              <Checkbox checked={!!value} onCheckedChange={(checked) => setFieldValue(field.id, !!checked)} />
              <span className="text-sm">{field.label}</span>
            </div>
          );

        case "select":
          return (
            <Select value={value || ""} onValueChange={(next) => setFieldValue(field.id, next)}>
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

        case "date":
          return <Input type="date" value={value || ""} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

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

        default:
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
    const sections = sectionsByTab[tabId] || [];
    if (sections.length === 0) return null;

    return (
      <div className="space-y-10">
        {sections.map(({ section, fields }) => (
          <Card key={section} className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4 border-b mb-6">
              <CardTitle className="text-xl font-bold tracking-tight text-[#006b6d]">{section}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Specific details for your profile in this category.</p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    {field.type !== "boolean" && field.type !== "checkbox" && (
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-semibold text-foreground/70">{field.label}</label>
                        {field.required && <span className="text-destructive font-bold">*</span>}
                      </div>
                    )}
                    <div className="transition-all duration-200 focus-within:ring-2 focus-within:ring-[#009698]/20 focus-within:ring-offset-2 rounded-md">
                      {renderField(field)}
                    </div>
                  </div>
                ))}
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
    portfolio: Share2
  };

  if (!showTabs) {
    return renderTabContent(activeTab);
  }

  return (
    <div className="space-y-8">
      <Tabs 
        value={activeTab} 
        onValueChange={setInternalActiveTab}
        className="w-full"
      >
        <TabsList className="sticky top-0 z-10 h-14 w-full justify-start overflow-x-auto bg-white/80 backdrop-blur-md border shadow-sm gap-2 p-1.5 rounded-2xl scrollbar-hide mb-6">
          {tabGroups.map(tab => {
            const hasFields = sectionsByTab[tab.id]?.length > 0;
            if (!hasFields) return null;
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
                <CardContent className="p-8 md:p-12">
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
