import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X, Calendar, Briefcase, User, Building, MapPin, Link as LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CreditEntry {
  id: string;
  category: string;
  date: string;
  project: string;
  role: string;
  company: string;
  location?: string;
  link?: string;
}

interface CreditsListEditorProps {
  value: CreditEntry[] | string | any;
  onChange: (value: CreditEntry[]) => void;
  label: string;
}

const CATEGORIES = [
  "Theater",
  "Film",
  "Television",
  "Commercial",
  "Voiceover",
  "Stage",
  "Musical",
  "Corporate",
  "Web / Digital",
  "Other",
];

export function CreditsListEditor({ value, onChange, label }: CreditsListEditorProps) {
  const credits = Array.isArray(value) ? value : [];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<CreditEntry>>({
    category: "Film",
    date: "",
    project: "",
    role: "",
    company: "",
    location: "",
    link: "",
  });

  const handleAdd = () => {
    if (!form.project || !form.role) return;
    const newCredit: CreditEntry = {
      ...form as CreditEntry,
      id: Math.random().toString(36).substr(2, 9),
    };
    onChange([...credits, newCredit]);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    const updated = credits.map((c) => (c.id === id ? { ...c, ...form } : c));
    onChange(updated);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onChange(credits.filter((c) => c.id !== id));
  };

  const startEdit = (credit: CreditEntry) => {
    setForm(credit);
    setEditingId(credit.id);
    setIsAdding(false);
  };

  const resetForm = () => {
    setForm({
      category: "Film",
      date: "",
      project: "",
      role: "",
      company: "",
      location: "",
      link: "",
    });
    setIsAdding(false);
  };

  const CreditListItem = ({ credit }: { credit: CreditEntry }) => (
    <div className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl border bg-white/40 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/60 mb-3">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-[#009698]/10 text-[#009698] border-none rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            {credit.category}
          </Badge>
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase">
             <Calendar className="w-3 h-3" />
             {credit.date || "N/A"}
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
          <h4 className="text-lg font-bold text-slate-800">{credit.project}</h4>
          <span className="text-[#009698] text-sm font-semibold flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {credit.role}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            {credit.company}
          </span>
          {credit.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {credit.location}
            </span>
          )}
          {credit.link && (
            <a href={credit.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#009698] hover:underline">
              <LinkIcon className="w-3.5 h-3.5" />
              Reference Link
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={() => startEdit(credit)} className="rounded-xl hover:bg-[#009698]/10 hover:text-[#009698]">
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(credit.id)} className="rounded-xl hover:bg-red-50 hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const EntryForm = ({ mode = "add", onCancel }: { mode?: "add" | "edit"; onCancel: () => void }) => (
    <Card className="rounded-[2rem] border shadow-lg bg-white overflow-hidden mb-6 animate-in fade-in slide-in-from-top-4">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 mb-2">
          <h3 className="text-xl font-bold text-[#006b6d]">{mode === "add" ? "Add New Credit" : "Edit Credit"}</h3>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Category</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Date / Cycle</label>
            <Input 
              placeholder="e.g. JAN 2026 or 2024-2025" 
              value={form.date} 
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="e.g. Tenner Bag, Chasing Time" 
              value={form.project} 
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              className="rounded-xl border-slate-200 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
             <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
              Role / Part <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="e.g. Simon (Lead), Supporting Actor" 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Company / Director</label>
            <Input 
              placeholder="e.g. AJ Riley Chohan / A45 Films" 
              value={form.company} 
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Venue / Location</label>
            <Input 
              placeholder="e.g. Hope Theatre - London" 
              value={form.location} 
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Reference Link (Optional)</label>
            <Input 
              placeholder="https://..." 
              value={form.link} 
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} className="rounded-xl px-8 font-bold">Cancel</Button>
          <Button 
            className="rounded-xl bg-[#009698] hover:bg-[#009698]/90 text-white px-10 font-bold"
            onClick={() => mode === "add" ? handleAdd() : handleUpdate(editingId!)}
          >
            {mode === "add" ? "Save Credit" : "Update Credit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {credits.length > 0 ? (
        <div className="space-y-3">
          {credits.map((credit) => (
            editingId === credit.id ? (
              <EntryForm key={credit.id} mode="edit" onCancel={() => setEditingId(null)} />
            ) : (
              <CreditListItem key={credit.id} credit={credit} />
            )
          ))}
        </div>
      ) : !isAdding && (
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-4 bg-white/30 backdrop-blur-sm">
          <div className="w-16 h-16 bg-[#009698]/10 rounded-full flex items-center justify-center mx-auto">
             <Briefcase className="w-8 h-8 text-[#009698]" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-lg text-slate-800">No credits added yet</p>
            <p className="text-sm text-muted-foreground">Start building your professional experience list.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAdding(true)}
            className="rounded-2xl border-[#009698] text-[#009698] hover:bg-[#009698]/5 font-bold px-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Credit
          </Button>
        </div>
      )}

      {isAdding && <EntryForm onCancel={() => setIsAdding(false)} />}

      {!isAdding && !editingId && credits.length > 0 && (
        <Button 
          variant="outline" 
          onClick={() => setIsAdding(true)}
          className="w-full h-14 rounded-2xl border-dashed border-2 hover:border-[#009698] hover:bg-[#009698]/5 text-muted-foreground hover:text-[#009698] font-bold transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Credit
        </Button>
      )}
    </div>
  );
}
