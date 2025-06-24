"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { type AspectRatio } from '@/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface BackgroundImageGeneratorProps {
  onGenerate: (prompt: string, image: string | undefined, aspectRatio: AspectRatio) => void;
  isLoading: boolean;
}

export default function BackgroundImageGenerator({ onGenerate, isLoading }: BackgroundImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || imageBase64) {
      onGenerate(prompt, imageBase64 ?? undefined, aspectRatio);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate Background Image</CardTitle>
        <CardDescription>Describe the background or upload a reference image to guide the AI.</CardDescription>
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
                <RadioGroupItem value="16:9" id="bg-ar-16-9" />
                <Label htmlFor="bg-ar-16-9">16:9 (Landscape)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9:16" id="bg-ar-9-16" />
                <Label htmlFor="bg-ar-9-16">9:16 (Portrait)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1:1" id="bg-ar-1-1" />
                <Label htmlFor="bg-ar-1-1">1:1 (Square)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bg-image-upload">Upload a Reference Image (Optional)</Label>
            {imageBase64 ? (
              <div className="relative w-full max-w-sm">
                <Image src={imageBase64} alt="Preview" width={320} height={180} className="rounded-md object-cover aspect-video bg-muted" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleRemoveImage} type="button" disabled={isLoading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="bg-image-upload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-card ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50 transition-colors'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                        </div>
                        <Input id="bg-image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" ref={fileInputRef} disabled={isLoading} />
                    </label>
                </div> 
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bg-prompt">Prompt</Label>
            <Textarea
              id="bg-prompt"
              placeholder="e.g., A futuristic city skyline at night with neon lights, abstract style"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || (!prompt.trim() && !imageBase64)} className="w-full sm:w-auto">
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
