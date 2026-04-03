import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SpecializedFieldsProps {
  category: string;
  data: any;
  onChange: (name: string, value: any) => void;
}

export function ProfessionalSpecializedFields({ category, data, onChange }: SpecializedFieldsProps) {
  if (!category) return null;

  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');

  const renderPhotographerFields = () => (
    <Card>
      <CardHeader className="pb-3 text-primary"><CardTitle className="text-lg">Photography Specialisms</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Equipment</Label>
            <Input 
              value={data?.equipment_summary || ""} 
              onChange={(e) => onChange("equipment_summary", e.target.value)}
              placeholder="e.g. Sony A7R IV, Canon EOS R5..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Editing Software</Label>
            <Input 
              value={data?.editing_software || ""} 
              onChange={(e) => onChange("editing_software", e.target.value)}
              placeholder="e.g. Adobe Lightroom, Capture One"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lighting Style</Label>
          <Input 
            value={data?.lighting_style || ""} 
            onChange={(e) => onChange("lighting_style", e.target.value)}
            placeholder="e.g. Natural Light, Studio Strobes, High-Key"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderMUAFields = () => (
    <Card>
      <CardHeader className="pb-3 text-primary"><CardTitle className="text-lg">MUA & Hair Specialisms</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brands Used</Label>
          <Input 
            value={data?.brands_used || ""} 
            onChange={(e) => onChange("brands_used", e.target.value)}
            placeholder="e.g. MAC, Sephora, Kryolan..."
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/10">
            <Checkbox 
              id="sfx" 
              checked={!!data?.sfx_experience}
              onCheckedChange={(v) => onChange("sfx_experience", !!v)}
            />
            <label htmlFor="sfx" className="text-xs font-bold leading-none cursor-pointer">SFX Experience</label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/10">
            <Checkbox 
              id="group_booking" 
              checked={!!data?.group_booking_available}
              onCheckedChange={(v) => onChange("group_booking_available", !!v)}
            />
            <label htmlFor="group_booking" className="text-xs font-bold leading-none cursor-pointer">Group Bookings</label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCoachFields = () => (
    <Card>
      <CardHeader className="pb-3 text-primary"><CardTitle className="text-lg">Coaching Specialisms</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Modes</Label>
          <Select 
            value={data?.delivery_mode || "hybrid"}
            onValueChange={(v) => onChange("delivery_mode", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online Only</SelectItem>
              <SelectItem value="in_person">In-Person Only</SelectItem>
              <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialisms</Label>
          <Input 
            value={data?.coaching_specialisms || ""} 
            onChange={(e) => onChange("coaching_specialisms", e.target.value)}
            placeholder="e.g. Meisner Technique, Screen Acting, Accents"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderEditorFields = () => (
    <Card>
      <CardHeader className="pb-3 text-primary"><CardTitle className="text-lg">Editing Specialisms</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Editing Specialisms</Label>
          <Input 
            value={data?.editing_specialisms || ""} 
            onChange={(e) => onChange("editing_specialisms", e.target.value)}
            placeholder="e.g. Showreels, Documentaries, Motion Graphics"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">File Transfer Method</Label>
          <Input 
            value={data?.transfer_method || ""} 
            onChange={(e) => onChange("transfer_method", e.target.value)}
            placeholder="e.g. WeTransfer, Dropbox, physical hard drive"
          />
        </div>
      </CardContent>
    </Card>
  );

  switch (normalizedCategory) {
    case 'photographer': return renderPhotographerFields();
    case 'makeup_artist':
    case 'stylist': return renderMUAFields();
    case 'acting_coach':
    case 'voice_coach': return renderCoachFields();
    case 'videographer':
    case 'director':
    case 'editor': return renderEditorFields();
    default: return null;
  }
}
