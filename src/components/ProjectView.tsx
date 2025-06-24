"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Project, type Asset, type AspectRatio, type Character } from '@/types';
import { generateBackgroundImage } from '@/ai/flows/generate-background-image';
import { generateThumbnail } from '@/ai/flows/generate-thumbnail';
import { useToast } from "@/hooks/use-toast";
import BackgroundImageGenerator from './BackgroundImageGenerator';
import ThumbnailGenerator from './ThumbnailGenerator';
import AssetGrid from './AssetGrid';
import { CharacterManager } from './CharacterManager';
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
  
  const projectCharacters = project.characters || [];

  const addCharacter = (character: Omit<Character, 'id' | 'createdAt'>) => {
    const newCharacter: Character = {
      ...character,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updatedProject = {
      ...project,
      characters: [newCharacter, ...projectCharacters],
    };
    updateProject(updatedProject);
    toast({ title: "Character Saved!", description: "The new character has been added." });
  };

  const deleteCharacter = (characterId: string) => {
    const updatedCharacters = projectCharacters.filter(c => c.id !== characterId);
    const updatedProject = {
      ...project,
      characters: updatedCharacters,
    };
    updateProject(updatedProject);
    toast({ title: "Character Deleted", description: "The character has been removed." });
  };

  const handleGenerate = async (
    generator: (input: any) => Promise<any>,
    input: { prompt: string; image?: string; aspectRatio: AspectRatio, characterImage?: string },
    type: 'background' | 'thumbnail',
    setLoading: (loading: boolean) => void
    ) => {
    setLoading(true);
    try {
      const referenceImage = input.characterImage || input.image;
      const result = await generator({ prompt: input.prompt, image: referenceImage, aspectRatio: input.aspectRatio });
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
  
  const handleGenerateBackground = (prompt: string, image: string | undefined, aspectRatio: AspectRatio, characterImage: string | undefined) => {
    handleGenerate(generateBackgroundImage, { prompt, image, aspectRatio, characterImage }, 'background', setIsBgLoading);
  };
  
  const handleGenerateThumbnail = (prompt: string, image: string | undefined, aspectRatio: AspectRatio, characterImage: string | undefined) => {
    handleGenerate(generateThumbnail, { prompt, image, aspectRatio, characterImage }, 'thumbnail', setIsThumbLoading);
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

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 md:w-auto">
          <TabsTrigger value="background">Backgrounds</TabsTrigger>
          <TabsTrigger value="thumbnail">Thumbnails</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
        </TabsList>
        <TabsContent value="background" className="mt-6">
          <BackgroundImageGenerator onGenerate={handleGenerateBackground} isLoading={isBgLoading} characters={projectCharacters} />
        </TabsContent>
        <TabsContent value="thumbnail" className="mt-6">
          <ThumbnailGenerator onGenerate={handleGenerateThumbnail} isLoading={isThumbLoading} characters={projectCharacters} />
        </TabsContent>
        <TabsContent value="characters" className="mt-6">
           <CharacterManager 
            characters={projectCharacters}
            addCharacter={addCharacter}
            deleteCharacter={deleteCharacter}
          />
        </TabsContent>
      </Tabs>

      <AssetGrid assets={project.assets} deleteAsset={deleteAsset} />
    </div>
  );
}
