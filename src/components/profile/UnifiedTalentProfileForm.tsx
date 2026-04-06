import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UNIFIED_TALENT_PROFILE_FIELD_SPEC,
  UnifiedFieldSpec,
  shouldShowField,
} from "@/lib/unifiedTalentProfile/fieldSpec";
import { getReferenceOptions } from "@/lib/unifiedTalentProfile/referenceTables";

interface UnifiedTalentProfileFormProps {
  rootData: any;
  onChange: (nextRootData: any) => void;
  activeTab?: string;
  showTabs?: boolean;
}

const sectionOrder = [
  "Basic Profile",
  "Account / Contact",
  "Contact",
  "Account Setup",
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
  activeTab: externalActiveTab,
  showTabs = true 
}: UnifiedTalentProfileFormProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("general");
  const activeTab = externalActiveTab || internalActiveTab;

  const unified = rootData?.unifiedTalentProfile || {};
  const values = { ...rootData, ...unified };

  const tabGroups = useMemo(() => [
    {
      id: "general",
      label: "General",
      sections: ["Basic Profile", "Account / Contact", "Contact", "Account Setup", "Social", "Guardian Consent"]
    },
    {
      id: "professional",
      label: "Professional",
      sections: ["Talent Type", "Professional Overview", "Representation", "Booking Preferences", "Availability"]
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
        s.includes("Profile") || s.includes("Media") || s.includes("Measurements") || s.includes("Preferences")
      ).filter(s => s !== "Basic Profile" && s !== "Media")
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
    onChange({
      ...rootData,
      unifiedTalentProfile: {
        ...unified,
        [fieldId]: value,
      },
      [fieldId]: value,
    });
  };

  const getOptions = (field: UnifiedFieldSpec): string[] => {
    if (field.options?.length) return field.options;
    if (field.optionSource) return getReferenceOptions(field.optionSource);
    return [];
  };

  const renderField = (field: UnifiedFieldSpec) => {
    const value = values[field.id];
    const options = getOptions(field);

    switch (field.type) {
      case "boolean":
      case "checkbox":
        return (
          <div className="flex items-center gap-2 rounded-md border p-3">
            <Checkbox checked={!!value} onCheckedChange={(checked) => setFieldValue(field.id, !!checked)} />
            <span className="text-sm">{field.label}</span>
          </div>
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={(next) => setFieldValue(field.id, next)}>
            <SelectTrigger>
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
          <MultiSelectChecklist
            options={options}
            selected={normalizeArray(value)}
            onChange={(next) => setFieldValue(field.id, next)}
          />
        );

      case "textarea":
      case "url-list":
      case "multi-file-or-url":
        return (
          <Textarea
            rows={4}
            value={toDisplayValue(value)}
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
              onChange={(e) => setFieldValue(field.id, e.target.value)}
              placeholder="Paste URL"
            />
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFieldValue(field.id, `file:${file.name}`);
              }}
            />
          </div>
        );

      case "date":
        return <Input type="date" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

      case "email":
        return <Input type="email" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

      case "phone":
        return <Input type="tel" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

      case "number":
        return <Input type="number" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

      case "url":
        return <Input type="url" value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;

      default:
        return <Input value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} />;
    }
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
