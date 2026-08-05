import React from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Building2, User, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const WorkspaceSwitcher: React.FC = () => {
  const { user } = useAuth();
  const { activeWorkspace, collaborations, switchWorkspace } = useWorkspace();

  const isPersonal = activeWorkspace === "Personal" || !activeWorkspace;

  const currentLabel = isPersonal
    ? "Personal Workspace"
    : activeWorkspace.ownerProfile?.fullName ||
      activeWorkspace.ownerProfile?.companyName ||
      "Collaborator Workspace";

  const currentAvatar = isPersonal
    ? user?.profilePicture
    : activeWorkspace.ownerProfile?.avatarUrl;

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "WS";

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-card/80 backdrop-blur-sm border-border/80 text-foreground hover:bg-muted/80 h-12 px-3 rounded-xl shadow-xs transition-all"
        >
          <div className="flex items-center gap-2.5 truncate text-left">
            <Avatar className="h-7 w-7 rounded-lg border border-primary/20">
              <AvatarImage src={currentAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                {isPersonal ? <User className="w-3.5 h-3.5" /> : getInitials(currentLabel)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium leading-tight truncate text-foreground">
                {currentLabel}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
                {isPersonal ? (
                  <>Owner</>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-primary" /> Delegated
                  </>
                )}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-1.5 rounded-xl border border-border shadow-xl bg-card text-card-foreground">
        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase px-2.5 py-1.5 tracking-wider">
          Switch Workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/60" />

        {/* Personal Workspace Option */}
        <DropdownMenuItem
          onClick={() => switchWorkspace("Personal")}
          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
            isPersonal
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted text-foreground"
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium leading-tight">Personal Workspace</span>
              <span className="text-[10px] text-muted-foreground">My Account</span>
            </div>
          </div>
          {isPersonal && <Check className="w-4 h-4 text-primary shrink-0" />}
        </DropdownMenuItem>

        {/* Delegated Collaborations List */}
        {collaborations.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-1 bg-border/60" />
            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase px-2.5 py-1 tracking-wider">
              Shared Workspaces ({collaborations.length})
            </DropdownMenuLabel>

            {collaborations.map((collab) => {
              const isSelected =
                !isPersonal &&
                (activeWorkspace.id === collab.id || activeWorkspace.ownerId === collab.ownerId);

              const ownerName =
                collab.ownerProfile?.fullName ||
                collab.ownerProfile?.companyName ||
                "Workspace Owner";

              return (
                <DropdownMenuItem
                  key={collab.id}
                  onClick={() => switchWorkspace(collab.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors mt-0.5 ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Avatar className="h-7 w-7 rounded-lg border border-border">
                      <AvatarImage src={collab.ownerProfile?.avatarUrl} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs rounded-lg">
                        <Building2 className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium leading-tight truncate">
                        {ownerName}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {collab.accessScope === "all_projects"
                          ? "All Projects"
                          : `${collab.projectGrants?.length || 0} Project Grants`}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
