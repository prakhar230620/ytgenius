"use client";

import Image from 'next/image';
import { type Asset } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Wallpaper, Image as ImageIcon, Eye, ArrowLeft, Ratio, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AssetCardProps {
  asset: Asset;
  deleteAsset: (assetId: string) => void;
  togglePreference?: (assetId: string) => void;
  preferenceCount?: number;
  maxPreferences?: number;
}

export default function AssetCard({ asset, deleteAsset, togglePreference, preferenceCount = 0, maxPreferences = 5 }: AssetCardProps) {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = asset.dataUrl;
    
    // Create a unique filename with type, id, aspect ratio and timestamp
    const timestamp = new Date().getTime();
    const aspectRatioForFilename = asset.aspectRatio?.replace(':', 'x') || '16x9';
    const promptText = asset.prompt ? asset.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_') : 'untitled';
    
    link.download = `${asset.type}_${aspectRatioForFilename}_${promptText}_${asset.id.slice(0, 6)}_${timestamp}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formattedDate = formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true });

  const currentAspectRatio = asset.aspectRatio || '16:9';

  return (
    <Card className="overflow-hidden flex flex-col group transition-all hover:shadow-xl animate-in fade-in zoom-in-95">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative cursor-pointer bg-muted aspect-video overflow-hidden">
            <Image
              src={asset.dataUrl}
              alt={asset.prompt}
              fill
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-10 w-10 text-white" />
            </div>
            <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                <Badge variant="secondary" className="capitalize">
                    {asset.type === 'background' ? <Wallpaper className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                    {asset.type}
                </Badge>
                <Badge variant="secondary">
                    <Ratio className="h-3 w-3 mr-1" />
                    {currentAspectRatio}
                </Badge>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-7xl w-full p-4 flex items-center justify-center bg-transparent border-0 shadow-none">
            <DialogHeader>
                <DialogTitle className="sr-only">{asset.prompt || "Image Preview"}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Image
                src={asset.dataUrl}
                alt={asset.prompt}
                width={1920}
                height={1080}
                className="max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl"
              />
              <DialogClose asChild>
                <Button variant="secondary" className="absolute top-4 left-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </DialogClose>
            </div>
        </DialogContent>
      </Dialog>

      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground truncate" title={asset.prompt}>
          {asset.prompt || "Generated from image"}
        </p>
        <p className="text-xs text-muted-foreground/80 mt-2">{formattedDate}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        {togglePreference && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={asset.isPreference ? "secondary" : "ghost"} 
                  size="icon" 
                  onClick={() => togglePreference(asset.id)}
                  disabled={!asset.isPreference && preferenceCount >= maxPreferences}
                >
                  <Star className={`h-4 w-4 ${asset.isPreference ? "fill-current" : ""}`} />
                  <span className="sr-only">{asset.isPreference ? "Remove from preferences" : "Add to preferences"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {asset.isPreference 
                  ? "Remove from preferences" 
                  : preferenceCount >= maxPreferences 
                    ? `Maximum ${maxPreferences} preferences allowed` 
                    : "Add to preferences"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button variant="ghost" size="icon" onClick={downloadImage}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Download</span>
        </Button>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this asset. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAsset(asset.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
