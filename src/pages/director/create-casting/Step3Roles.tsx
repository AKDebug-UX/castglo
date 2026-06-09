import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import RoleCard from "./RoleCard";
import { FormRole } from "@/lib/project.utils";

interface Step3RolesProps {
  roles: FormRole[];
  addRole: () => void;
  removeRole: (roleId: string) => void;
  handleRoleChange: (roleID: string, field: string, value: any) => void;
}

export default function Step3Roles({
  roles,
  addRole,
  removeRole,
  handleRoleChange,
}: Step3RolesProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Characters & Roles</h2>
        <Button type="button" onClick={addRole} variant="outline" size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Add Role
        </Button>
      </div>

      {roles.map((role, index) => (
        <RoleCard
          key={role.id}
          role={role}
          index={index}
          isOnlyRole={roles.length <= 1}
          removeRole={removeRole}
          handleRoleChange={handleRoleChange}
        />
      ))}
      
      <Button 
        type="button" 
        onClick={addRole} 
        variant="outline" 
        className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" /> Add Another Role
      </Button>
    </div>
  );
}
