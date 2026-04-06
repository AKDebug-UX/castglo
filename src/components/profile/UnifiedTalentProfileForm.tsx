import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
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
  const [internalActiveTab, setInternalActiveTab] = useState("general");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const activeTab = externalActiveTab || internalActiveTab;

  const unified = rootData?.unifiedTalentProfile || {};
  const values = { ...rootData, ...unified };

  useEffect(() => {
    // Auto-detect and set country if not present
    if (!values.current_country) {
      const detected = detectCountry();
      if (detected) {
        onChange({
          ...rootData,
          unifiedTalentProfile: {
            ...unified,
            current_country: detected
          }
        });
      }
    }
  }, []);

  const tabGroups = useMemo(() => [
    {
      id: "general",
      label: "General",
      sections: ["Basic Profile", "Account / Contact", "Contact", "Social", "Guardian Consent"]
    },
    {
      id: "professional",
      label: "Professional",
      sections: ["Talent Type", "Professional Overview", "Professional Identity", "Representation", "Booking Preferences", "Availability"]
    },
    {
      id: "business",
      label: "Business",
      sections: ["Business & Facilities", "Business Terms"]
    },
    {
      id: "attributes",
      label: "Attributes & Bio",
      sections: ["Appearance", "About You"]
    },
    {
      id: "media",
      label: "Media",
      sections: ["Media"]
    },
    {
      id: "specialized",
      label: "Specialized",
      sections: sectionOrder.filter(s => 
        s.includes("Profile") || s.includes("Media") || s.includes("Measurements") || s.includes("Preferences") || s.includes("Specialisms")
      ).filter(s => s !== "Basic Profile" && s !== "Media" && s !== "Professional Identity")
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

    // Catch any sections not in tabGroups
    const groupedSections = new Set(tabGroups.flatMap(t => t.sections));
    const otherSections = Object.keys(bucket).filter(s => !groupedSections.has(s));
    
    if (otherSections.length > 0) {
      result["other"] = otherSections.map(sectionName => ({
        section: sectionName,
        fields: bucket[sectionName]
      }));
    }

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

    onChange({
      ...rootData,
      unifiedTalentProfile: {
        ...unified,
        [fieldId]: value,
      },
      [fieldId]: value,
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
    const options = getOptions(field);
    const hasError = !!errors[field.id];

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
          return <Input type="email" value={value || ""} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

        case "phone":
          return <Input type="tel" value={value || ""} className={hasError ? 'border-destructive' : ''} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

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
      <div className="space-y-6">
        {sections.map(({ section, fields }) => (
          <Card key={section}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  {field.type !== "boolean" && field.type !== "checkbox" && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-foreground/80">{field.label}</label>
                      {field.required && <Badge variant="outline" className="text-[10px] h-4">Required</Badge>}
                    </div>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {onSave && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleTabSave} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (!showTabs) {
    return renderTabContent(activeTab);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unified Talent Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete your profile across all categories. Dynamic fields appear based on your talent type.
          </p>
        </CardHeader>
      </Card>

      <Tabs 
        value={activeTab} 
        onValueChange={setInternalActiveTab}
        className="w-full"
      >
        <div className="bg-card rounded-lg border p-1 mb-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-none gap-2 p-1">
            {tabGroups.map(tab => {
              const hasFields = sectionsByTab[tab.id]?.length > 0;
              if (!hasFields) return null;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {tab.label}
                </TabsTrigger>
              );
            })}
            {sectionsByTab["other"]?.length > 0 && (
              <TabsTrigger value="other" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Other
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {tabGroups.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-0">
            {renderTabContent(tab.id)}
          </TabsContent>
        ))}

        {sectionsByTab["other"] && (
          <TabsContent value="other" className="space-y-6 mt-0">
            {renderTabContent("other")}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
