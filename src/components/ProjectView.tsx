"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Project, type Asset, type AspectRatio } from '@/types';
import { generateBackgroundImage } from '@/ai/flows/generate-background-image';
import { generateThumbnail } from '@/ai/flows/generate-thumbnail';
import { useToast } from "@/hooks/use-toast";
import BackgroundImageGenerator from './BackgroundImageGenerator';
import ThumbnailGenerator from './ThumbnailGenerator';
import AssetGrid from './AssetGrid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface ProjectViewProps {
  project: Project;
  updateProject: (project: Project) => void;
  deleteProject: () => void;
  onGoHome: () => void;
}

export default function ProjectView({ project, updateProject, deleteProject, onGoHome }: ProjectViewProps) {
  const [isBgLoading, setIsBgLoading] = useState(false);
  const [isThumbLoading, setIsThumbLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateBackground = async (prompt: string, image: string | undefined, aspectRatio: AspectRatio) => {
    setIsBgLoading(true);
    try {
      const result = await generateBackgroundImage({ prompt, image, aspectRatio });
      const newAsset: Asset = {
        id: new Date().toISOString(),
        type: 'background',
        dataUrl: result.backgroundImageDataUri,
        prompt,
        createdAt: new Date().toISOString(),
        aspectRatio,
      };
      updateProject({ ...project, assets: [newAsset, ...project.assets] });
      toast({ title: "Success!", description: "Background image generated." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate background image." });
    } finally {
      setIsBgLoading(false);
    }
  };

  const handleGenerateThumbnail = async (prompt: string, image: string | undefined, aspectRatio: AspectRatio) => {
    setIsThumbLoading(true);
    try {
      const result = await generateThumbnail({ prompt, image, aspectRatio });
      const newAsset: Asset = {
        id: new Date().toISOString(),
        type: 'thumbnail',
        dataUrl: result.thumbnail,
        prompt,
        createdAt: new Date().toISOString(),
        aspectRatio,
      };
      updateProject({ ...project, assets: [newAsset, ...project.assets] });
      toast({ title: "Success!", description: "Thumbnail generated." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate thumbnail." });
    } finally {
      setIsThumbLoading(false);
    }
  };

  const deleteAsset = (assetId: string) => {
    const updatedAssets = project.assets.filter(asset => asset.id !== assetId);
    updateProject({ ...project, assets: updatedAssets });
    toast({ title: "Asset deleted", description: "The asset has been removed from your project." });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground">Manage your project assets and generate new ones.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onGoHome}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Welcome
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your project and all its assets.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteProject} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="background">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="background">Background Generator</TabsTrigger>
          <TabsTrigger value="thumbnail">Thumbnail Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="background" className="mt-6">
          <BackgroundImageGenerator onGenerate={handleGenerateBackground} isLoading={isBgLoading} />
        </TabsContent>
        <TabsContent value="thumbnail" className="mt-6">
          <ThumbnailGenerator onGenerate={handleGenerateThumbnail} isLoading={isThumbLoading} />
        </TabsContent>
      </Tabs>

      <AssetGrid assets={project.assets} deleteAsset={deleteAsset} />
    </div>
  );
}
