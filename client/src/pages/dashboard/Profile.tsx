import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Upload } from "lucide-react";
import userAvatar from "@/assets/user-avatar.jpg";

const skills = [
  { name: "Improvisation", level: "Expert" },
  { name: "Voice Acting", level: "Intermediate" },
  { name: "Character Study", level: "Beginner" },
  { name: "Stage Performance", level: "Beginner" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile Setting</h1>
          <p className="text-muted-foreground">Manage your professional profile and portfolio</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          {["Basic Info", "Physical", "Skills", "Education", "Portfolio"].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab.toLowerCase().replace(" ", "-")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal and contact information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userAvatar} />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">First Name</label>
                  <Input defaultValue="Jordan" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                  <Input defaultValue="Davis" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  About Me <span className="text-muted-foreground font-normal">(65/500)</span>
                </label>
                <Textarea 
                  rows={4}
                  defaultValue="Passionate actor with 5+ years of experience in theater and film. Specializing in dramatic roles with a background in method acting and improvisation."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Career Highlights <span className="text-muted-foreground font-normal">(88/1500)</span>
                </label>
                <Textarea 
                  rows={3}
                  defaultValue="Award-winning performer. Featured in multiple independent films and theater productions."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Gender</label>
                  <Select defaultValue="male">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Age Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="25-35">25-35</SelectItem>
                      <SelectItem value="35-45">35-45</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" defaultValue="jordan.davis@gmail.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input type="tel" defaultValue="+234" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Location</label>
                  <Input defaultValue="Los Angeles, CA" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Dress</label>
                  <Select defaultValue="m">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Physical Attributes</CardTitle>
              <p className="text-sm text-muted-foreground">Provide physical details for casting considerations</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Button variant="tab">Imperial (ft/in, lbs)</Button>
                <Button variant="tab-outline">Metric (cm, kg)</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Height(ft)</label>
                  <Input defaultValue="5" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Height(in)</label>
                  <Input defaultValue="8" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Height(cm)</label>
                  <Input defaultValue="173" disabled />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Weight(lbs)</label>
                  <Input defaultValue="150" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Weight(kg)</label>
                  <Input defaultValue="68" disabled />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Eye Color</label>
                  <Select defaultValue="brown">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="hazel">Hazel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hair Color</label>
                  <Select defaultValue="brown">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="blonde">Blonde</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Body Type</label>
                  <Select defaultValue="athletic">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="muscular">Muscular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Chest/Bust(cm)</label>
                  <Input defaultValue="38" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Waist(cm)</label>
                  <Input defaultValue="32" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hip(cm)</label>
                  <Input defaultValue="36" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Attributes</CardTitle>
              <p className="text-sm text-muted-foreground">Add your acting skills and expertise levels</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Add Skills</label>
                <div className="flex gap-2">
                  <Input placeholder="Type a skill or select from suggestions..." className="flex-1" />
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Custom Skill
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {skills.map((skill) => (
                  <div 
                    key={skill.name} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{skill.level}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <p className="text-sm text-muted-foreground">Add your acting training and education</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-border">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">School*</label>
                    <Input placeholder="Enter school name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Degree/Course*</label>
                    <Input placeholder="Enter degree or course" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Instructor</label>
                    <Input placeholder="Enter instructor name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Location</label>
                    <Input placeholder="Enter location" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Year Completed</label>
                    <Input placeholder="Enter year" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="destructive">Remove Entry</Button>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Education Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <p className="text-sm text-muted-foreground">Upload photos, videos, and your resume</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Resume</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">Upload Resume (PDF, DOC, DOCX)</p>
                  <Button variant="outline" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Professional Headshot</p>
                </div>
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Demo Reel 2024</p>
                </div>
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Theater Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
