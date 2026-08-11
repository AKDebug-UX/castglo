import React, { useState, useEffect } from 'react';
import { PermissionsPanel } from './PermissionsPanel';
import { Permissions } from '@/types/collaborator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ChevronDown, ChevronUp, Film } from 'lucide-react';
import api from '@/lib/api';

export interface ProjectGrantItem {
  projectId: string;
  permissions: Permissions;
}

interface ProjectGrantSelectorProps {
  grants: ProjectGrantItem[];
  onChange: (updatedGrants: ProjectGrantItem[]) => void;
  disabled?: boolean;
}

interface Project {
  id: string;
  title: string;
  category?: string;
  status?: string;
}

export const ProjectGrantSelector: React.FC<ProjectGrantSelectorProps> = ({
  grants,
  onChange,
  disabled = false,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        let res;
        try {
          res = await api.get('/projects/me');
        } catch {
          res = await api.get('/casting-calls/user/my-listings');
        }

        const list = res.data?.data?.projects || res.data?.data || res.data || [];
        setProjects(
          list.map((p: any) => ({
            id: p.id || p._id,
            title: p.title || p.name || 'Untitled Project',
            category: p.category || p.projectType,
            status: p.status,
          }))
        );
      } catch (error) {
        console.error('Failed to load user projects for selector', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const defaultPermissions: Permissions = {
    viewApplicants: true,
    moveApplicants: true,
    addNotes: true,
    sendMessages: true,
    editProject: false,
    editRoles: false,
    manageCollaborators: false,
  };

  const handleToggleProject = (projectId: string, isSelected: boolean) => {
    if (isSelected) {
      onChange([...grants, { projectId, permissions: { ...defaultPermissions } }]);
      setExpandedProjectId(projectId);
    } else {
      onChange(grants.filter((g) => g.projectId !== projectId));
      if (expandedProjectId === projectId) {
        setExpandedProjectId(null);
      }
    }
  };

  const handleUpdatePermissions = (projectId: string, newPerms: Permissions) => {
    onChange(
      grants.map((g) => (g.projectId === projectId ? { ...g, permissions: newPerms } : g))
    );
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
        <span className="text-sm">Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm">
        <Film className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-500" />
        <p className="font-medium text-slate-600 dark:text-slate-400">No active projects found in your workspace.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create a project first to grant specific project access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredProjects.map((project) => {
          const grant = grants.find((g) => g.projectId === project.id);
          const isSelected = !!grant;
          const isExpanded = expandedProjectId === project.id;

          return (
            <div
              key={project.id}
              className={`rounded-xl border transition-all ${
                isSelected
                  ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between p-3.5">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => !disabled && handleToggleProject(project.id, !isSelected)}
                >
                  <Checkbox
                    id={`proj-${project.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      !disabled && handleToggleProject(project.id, !!checked)
                    }
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{project.title}</h4>
                    {project.category && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">{project.category}</span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <button
                    type="button"
                    onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    <span>Configure</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {isSelected && isExpanded && (
                <div className="px-4 pb-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/40 rounded-b-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                    Permissions for{' '}
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">{project.title}</span>:
                  </p>
                  <PermissionsPanel
                    permissions={grant.permissions}
                    onChange={(updated) => handleUpdatePermissions(project.id, updated)}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
