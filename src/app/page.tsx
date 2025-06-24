"use client";

import { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { type Project } from '@/types';
import Header from '@/components/Header';
import ProjectView from '@/components/ProjectView';
import { Logo } from '@/components/icons';

export default function Home() {
  const [projects, setProjects] = useLocalStorage<Record<string, Project>>('ytgenius-projects', {});
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string | null>('ytgenius-active-project', null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeProject = useMemo(() => {
    if (!activeProjectId || !projects[activeProjectId]) {
      const firstProjectId = Object.keys(projects)[0];
      if (firstProjectId && isClient) {
        setActiveProjectId(firstProjectId);
        return projects[firstProjectId];
      }
      return null;
    }
    return projects[activeProjectId];
  }, [activeProjectId, projects, setActiveProjectId, isClient]);

  const createProject = (name: string) => {
    const id = new Date().toISOString();
    const newProject: Project = {
      id,
      name,
      createdAt: id,
      assets: [],
    };
    setProjects(prev => ({ ...prev, [id]: newProject }));
    setActiveProjectId(id);
  };
  
  const updateProject = (updatedProject: Project) => {
    setProjects(prev => ({ ...prev, [updatedProject.id]: updatedProject }));
  };

  const deleteProject = (projectId: string) => {
    const newProjects = { ...projects };
    delete newProjects[projectId];
    setProjects(newProjects);
    if (activeProjectId === projectId) {
      const firstProjectId = Object.keys(newProjects)[0] || null;
      setActiveProjectId(firstProjectId);
    }
  };

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Logo className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        projects={Object.values(projects)}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        onCreateProject={createProject}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {activeProject ? (
          <ProjectView
            key={activeProject.id}
            project={activeProject}
            updateProject={updateProject}
            deleteProject={() => deleteProject(activeProject.id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <h1 className="font-headline text-4xl font-bold text-primary">Welcome to YTGenius</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Create a project to start generating stunning backgrounds and thumbnails for your YouTube channel.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
