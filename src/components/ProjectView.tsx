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
  const MAX_PREFERENCES = 5; // Maximum number of preferences allowed

  const handleGenerate = async (
    generator: (input: any) => Promise<any>,
    input: { prompt: string; image?: string; aspectRatio: AspectRatio; referenceImages?: string[] },
    type: 'background' | 'thumbnail',
    setLoading: (loading: boolean) => void
    ) => {
    setLoading(true);
    try {
      const result = await generator({ 
        prompt: input.prompt, 
        image: input.image, 
        referenceImages: input.referenceImages,
        aspectRatio: input.aspectRatio 
      });
      const dataUrl = type === 'background' ? result.backgroundImageDataUri : result.thumbnail;
      
      const newAsset: Asset = {
        id: new Date().toISOString(),
        type: type,
        dataUrl: dataUrl,
        prompt: input.prompt,
        createdAt: new Date().toISOString(),
        aspectRatio: input.aspectRatio,
      };
      updateProject({ ...project, assets: [newAsset, ...project.assets] });
      toast({ title: "Success!", description: `${type.charAt(0).toUpperCase() + type.slice(1)} generated.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: `Failed to generate ${type}.` });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateBackground = (prompt: string, image: string | undefined, aspectRatio: AspectRatio, referenceImages?: string[]) => {
    handleGenerate(generateBackgroundImage, { prompt, image, aspectRatio, referenceImages }, 'background', setIsBgLoading);
  };
  
  const handleGenerateThumbnail = (prompt: string, image: string | undefined, aspectRatio: AspectRatio, referenceImages?: string[]) => {
    handleGenerate(generateThumbnail, { prompt, image, aspectRatio, referenceImages }, 'thumbnail', setIsThumbLoading);
  };
  
  const deleteAsset = (assetId: string) => {
    const updatedAssets = project.assets.filter(asset => asset.id !== assetId);
    updateProject({ ...project, assets: updatedAssets });
    toast({ title: "Asset deleted", description: "The asset has been removed from your project." });
  };
  
  const togglePreference = (assetId: string) => {
    const updatedAssets = project.assets.map(asset => {
      if (asset.id === assetId) {
        return { ...asset, isPreference: !asset.isPreference };
      }
      return asset;
    });
    updateProject({ ...project, assets: updatedAssets });
    
    const asset = project.assets.find(a => a.id === assetId);
    const isNowPreference = !asset?.isPreference;
    
    toast({ 
      title: isNowPreference ? "Added to preferences" : "Removed from preferences",
      description: isNowPreference 
        ? "This asset will be used as a reference for future generations." 
        : "This asset will no longer be used as a reference."
    });
  };
  
  // Calculate the number of preference assets
  const preferenceCount = project.assets.filter(asset => asset.isPreference).length;

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

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="background">Backgrounds</TabsTrigger>
          <TabsTrigger value="thumbnail">Thumbnails</TabsTrigger>
        </TabsList>
        <TabsContent value="background" className="mt-6">
          <BackgroundImageGenerator 
            onGenerate={handleGenerateBackground} 
            isLoading={isBgLoading} 
            preferenceAssets={project.assets.filter(asset => asset.isPreference)}
          />
        </TabsContent>
        <TabsContent value="thumbnail" className="mt-6">
          <ThumbnailGenerator 
            onGenerate={handleGenerateThumbnail} 
            isLoading={isThumbLoading} 
            preferenceAssets={project.assets.filter(asset => asset.isPreference)}
          />
        </TabsContent>
      </Tabs>

      <AssetGrid 
        assets={project.assets} 
        deleteAsset={deleteAsset} 
        togglePreference={togglePreference}
        preferenceCount={preferenceCount}
        maxPreferences={MAX_PREFERENCES}
      />
    </div>
  );
}
