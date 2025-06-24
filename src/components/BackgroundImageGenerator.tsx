"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface BackgroundImageGeneratorProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export default function BackgroundImageGenerator({ onGenerate, isLoading }: BackgroundImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate Background Image</CardTitle>
        <CardDescription>Describe the background you want to create. Be as specific as you can for the best results.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., A futuristic city skyline at night with neon lights, abstract style"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full sm:w-auto">
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
