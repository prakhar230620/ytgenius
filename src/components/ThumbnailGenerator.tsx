"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Upload, X, Camera, Clipboard, Image as ImageIcon, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { Asset, type AspectRatio } from '@/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ThumbnailGeneratorProps {
  onGenerate: (prompt: string, image: string | undefined, aspectRatio: AspectRatio, referenceImages?: string[]) => void;
  isLoading: boolean;
  preferenceAssets?: Asset[];
}

export default function ThumbnailGenerator({ onGenerate, isLoading, preferenceAssets = [] }: ThumbnailGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate total selected images count (uploaded + preferences)
  const totalSelectedImagesCount = uploadedImages.length + selectedPreferences.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Calculate how many files we can add based on preference selections and existing images
      const currentImagesCount = uploadedImages.length;
      const maxAllowedFiles = 5 - selectedPreferences.length - currentImagesCount;
      
      if (files.length > maxAllowedFiles) {
        // Alert user if they're trying to upload too many files
        alert(`You can only select up to ${maxAllowedFiles} file(s) as you already have ${currentImagesCount} image(s) and ${selectedPreferences.length} preference image(s) selected. Total limit is 5 images.`);
        // Reset file input
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Process all files and add them to uploadedImages
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveAllImages = () => {
    setUploadedImages([]);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }
  
  // Function to remove a specific image
  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || uploadedImages.length > 0 || selectedPreferences.length > 0) {
      // Get all selected preference images
      const selectedPreferenceImages = preferenceAssets
        .filter(asset => selectedPreferences.includes(asset.id))
        .map(asset => asset.dataUrl);
      
      const allImages = [...uploadedImages, ...selectedPreferenceImages];
      
      onGenerate(
        prompt, 
        allImages.length > 0 ? allImages[0] : undefined, 
        aspectRatio, 
        allImages.length > 1 ? allImages.slice(1) : undefined
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate Thumbnail</CardTitle>
        <CardDescription>Describe your thumbnail or upload a base image for amazing results.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <RadioGroup
              value={aspectRatio}
              onValueChange={(value) => setAspectRatio(value as AspectRatio)}
              className="flex flex-wrap gap-x-4 gap-y-2"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="16:9" id="thumb-ar-16-9" />
                <Label htmlFor="thumb-ar-16-9">16:9 (Landscape)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9:16" id="thumb-ar-9-16" />
                <Label htmlFor="thumb-ar-9-16">9:16 (Portrait)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1:1" id="thumb-ar-1-1" />
                <Label htmlFor="thumb-ar-1-1">1:1 (Square)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Images (Optional, Multiple Allowed)</Label>
            {uploadedImages.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Uploaded Images ({uploadedImages.length})</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative aspect-video">
                        <Image 
                          src={img} 
                          alt={`Image ${index + 1}`} 
                          fill 
                          className="object-cover rounded-md"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-5 w-5" 
                          onClick={() => handleRemoveImage(index)} 
                          type="button" 
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-start mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Add More Images
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-2">
                        <h4 className="font-medium">Upload Options</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <label htmlFor="image-upload-more" className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <FolderOpen className="w-6 h-6 mb-1 text-muted-foreground" />
                            <span className="text-xs">From Device</span>
                            <Input id="image-upload-more" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" disabled={isLoading} multiple={true} />
                          </label>
                          <label htmlFor="camera-upload-more" className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <Camera className="w-6 h-6 mb-1 text-muted-foreground" />
                            <span className="text-xs">Camera</span>
                            <Input id="camera-upload-more" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} disabled={isLoading} />
                          </label>
                          <button 
                            className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => {
                              navigator.clipboard.read().then(items => {
                                for (const item of items) {
                                  if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                                    item.getType(item.types.find(type => type.startsWith('image/')) || 'image/png').then(blob => {
                                      const file = new File([blob], 'clipboard-image.png', { type: blob.type });
                                      const fileList = new DataTransfer();
                                      fileList.items.add(file);
                                      handleImageChange({ target: { files: fileList.files } } as React.ChangeEvent<HTMLInputElement>);
                                    });
                                  }
                                }
                              }).catch(err => {
                                console.error('Failed to read clipboard contents: ', err);
                                alert('Failed to read clipboard. Make sure you have an image copied and try again.');
                              });
                            }}
                            type="button"
                            disabled={isLoading}
                          >
                            <Clipboard className="w-6 h-6 mb-1 text-muted-foreground" />
                            <span className="text-xs">Paste</span>
                          </button>
                          <label htmlFor="selfie-upload-more" className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                            <span className="text-xs">Selfie</span>
                            <Input id="selfie-upload-more" type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageChange} disabled={isLoading} />
                          </label>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-card ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50 transition-colors'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (Multiple files allowed)</p>
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <div className="space-y-2">
                                <h4 className="font-medium">Upload Options</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                        <FolderOpen className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <span className="text-xs">From Device</span>
                                        <Input id="image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" ref={fileInputRef} disabled={isLoading} multiple={true} />
                                    </label>
                                    <label htmlFor="camera-upload" className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Camera className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <span className="text-xs">Camera</span>
                                        <Input id="camera-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} disabled={isLoading} />
                                    </label>
                                    <button 
                                        className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.read().then(items => {
                                                for (const item of items) {
                                                    if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                                                        item.getType(item.types.find(type => type.startsWith('image/')) || 'image/png').then(blob => {
                                                            const file = new File([blob], 'clipboard-image.png', { type: blob.type });
                                                            const fileList = new DataTransfer();
                                                            fileList.items.add(file);
                                                            handleImageChange({ target: { files: fileList.files } } as React.ChangeEvent<HTMLInputElement>);
                                                        });
                                                    }
                                                }
                                            }).catch(err => {
                                                console.error('Failed to read clipboard contents: ', err);
                                                alert('Failed to read clipboard. Make sure you have an image copied and try again.');
                                            });
                                        }}
                                        type="button"
                                        disabled={isLoading}
                                    >
                                        <Clipboard className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <span className="text-xs">Paste</span>
                                    </button>
                                    <label htmlFor="selfie-upload" className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                        <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <span className="text-xs">Selfie</span>
                                        <Input id="selfie-upload" type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageChange} disabled={isLoading} />
                                    </label>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div> 
            )}
          </div>
          {preferenceAssets.length > 0 && (
            <div className="space-y-2">
              <Label>Use Preference Images (Select up to {5 - uploadedImages.length})</Label>
              <div className="grid grid-cols-5 gap-2">
                {preferenceAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    className={`relative cursor-pointer border-2 rounded-md overflow-hidden transition-all ${selectedPreferences.includes(asset.id) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted'}`}
                    onClick={() => {
                      if (selectedPreferences.includes(asset.id)) {
                        setSelectedPreferences(prev => prev.filter(id => id !== asset.id));
                      } else if (totalSelectedImagesCount < 5) {
                        setSelectedPreferences(prev => [...prev, asset.id]);
                      } else {
                        alert("You can only select a total of 5 images (uploaded + preferences combined).");
                      }
                    }}
                  >
                    <div className="aspect-video relative">
                      <Image 
                        src={asset.dataUrl} 
                        alt={asset.prompt || 'Preference image'} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    {selectedPreferences.includes(asset.id) && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {selectedPreferences.indexOf(asset.id) + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPreferences.length} of 5 preference images selected
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Add text 'SHOCKING!' in a bold, yellow font. Make the background more vibrant."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || (!prompt.trim() && uploadedImages.length === 0 && selectedPreferences.length === 0)} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
