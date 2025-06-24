"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, List, Check } from 'lucide-react';
import { Logo } from '@/components/icons';
import { type Project } from '@/types';
import { cn } from '@/lib/utils';
import InstallButton from "@/components/InstallButton";

interface HeaderProps {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  onCreateProject: (name: string) => void;
  onGoHome: () => void;
}

export default function Header({ projects, activeProjectId, setActiveProjectId, onCreateProject, onGoHome }: HeaderProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setIsProjectsDialogOpen(false);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button onClick={onGoHome} className="flex items-center gap-4 rounded-sm p-1 -m-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl font-bold text-primary">YTGenius</h1>
        </button>
        <div className="flex items-center gap-2">
          <InstallButton className="hidden sm:flex" />
          <Dialog open={isProjectsDialogOpen} onOpenChange={setIsProjectsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-[180px] sm:w-[220px] justify-start">
                <List className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{activeProject ? activeProject.name : 'Select Project'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-headline">Manage Projects</DialogTitle>
                <DialogDescription>Select an existing project or create a new one to get started.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 max-h-[40vh] space-y-2 overflow-y-auto pr-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className={cn(
                        "w-full flex items-center justify-between text-left p-3 rounded-md transition-colors",
                        project.id === activeProjectId 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      )}
                  >
                    <span className="truncate">{project.name}</span>
                    {project.id === activeProjectId && <Check className="h-4 w-4" />}
                  </button>
                ))}
                 {projects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No projects yet. Create one below!</p>
                )}
              </div>
              <div className="pt-4 border-t">
                <label htmlFor="new-project-name" className="text-sm font-medium">Create New Project</label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="new-project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Channel"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  />
                  <Button onClick={handleCreateProject} disabled={!newProjectName.trim()} size="icon">
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Create</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
