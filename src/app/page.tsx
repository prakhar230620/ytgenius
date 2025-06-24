"use client";

import { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { type Project } from '@/types';
import Header from '@/components/Header';
import ProjectView from '@/components/ProjectView';
import { Logo } from '@/components/icons';
import ProjectCard from '@/components/ProjectCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusSquare } from 'lucide-react';


export default function Home() {
  const [projects, setProjects] = useLocalStorage<Record<string, Project>>('ytgenius-projects', {});
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string | null>('ytgenius-active-project', null);
  const [isClient, setIsClient] = useState(false);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeProject = useMemo(() => {
    return activeProjectId ? projects[activeProjectId] : null;
  }, [activeProjectId, projects]);

  useEffect(() => {
    if (isClient) {
      // This checks if an active project ID is set, but that project no longer exists.
      const activeProjectIsInvalid = activeProjectId && !projects[activeProjectId];

      if (activeProjectIsInvalid) {
        // Fallback to null (welcome screen) if the active project is gone.
        setActiveProjectId(null);
      }
    }
  }, [activeProjectId, projects, isClient, setActiveProjectId]);


  const createProject = (name: string) => {
    const id = new Date().toISOString();
    const newProject: Project = {
      id,
      name,
      createdAt: id,
      assets: [],
      characters: [],
    };
    setProjects(prev => ({ ...prev, [id]: newProject }));
    setActiveProjectId(id);
  };
  
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreateProjectDialogOpen(false);
    }
  };
  
  const updateProject = (updatedProject: Project) => {
    setProjects(prev => ({ ...prev, [updatedProject.id]: updatedProject }));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      delete newProjects[projectId];
      
      // If the deleted project was the active one, go back to welcome screen
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
      }

      return newProjects;
    });
  };

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Logo className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const goHome = () => setActiveProjectId(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        projects={Object.values(projects)}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        onCreateProject={createProject}
        onGoHome={goHome}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {activeProject ? (
          <ProjectView
            key={activeProject.id}
            project={activeProject}
            updateProject={updateProject}
            deleteProject={() => deleteProject(activeProject.id)}
            onGoHome={goHome}
          />
        ) : (
          <div>
            <div className="flex flex-col items-center justify-center text-center py-12">
              <h1 className="font-headline text-4xl font-bold text-primary">Welcome to YTGenius</h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Select a project below to continue, or create a new one to start your next masterpiece.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                <DialogTrigger asChild>
                    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center border-2 border-dashed hover:border-primary hover:text-primary min-h-[220px]">
                        <div className="text-center p-6">
                            <PlusSquare className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="mt-4 font-semibold">Create New Project</p>
                        </div>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>Give your new project a name to get started.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-project-name-page" className="text-right">Name</Label>
                            <Input
                                id="new-project-name-page"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="My Awesome Channel"
                                className="col-span-3"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>Create Project</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>

              {Object.values(projects).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onSelectProject={setActiveProjectId}
                  onDeleteProject={deleteProject}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
