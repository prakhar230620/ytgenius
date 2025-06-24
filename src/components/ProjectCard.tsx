"use client";

import { type Project } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectCard({ project, onSelectProject, onDeleteProject }: ProjectCardProps) {
  const formattedDate = formatDistanceToNow(new Date(project.createdAt), { addSuffix: true });

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent card click from firing when delete button is clicked
    if ((e.target as HTMLElement).closest('[data-delete-button]')) {
      return;
    }
    onSelectProject(project.id);
  };
  
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col min-h-[220px]"
      onClick={handleCardClick}
    >
      <CardHeader className="flex-row items-start justify-between pb-2">
        <div className="flex-grow overflow-hidden">
            <CardTitle className="truncate" title={project.name}>{project.name}</CardTitle>
            <CardDescription className="mt-2">{formattedDate}</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive shrink-0 -mt-2 -mr-2"
              data-delete-button
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Project</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project "{project.name}" and all its assets.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteProject(project.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{project.assets.length}</span> {project.assets.length === 1 ? 'asset' : 'assets'}
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-sm font-medium text-primary group-hover:underline">
          Open Project &rarr;
        </span>
      </CardFooter>
    </Card>
  );
}
