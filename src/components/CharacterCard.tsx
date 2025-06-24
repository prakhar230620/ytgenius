"use client";

import Image from 'next/image';
import { type Character } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface CharacterCardProps {
  character: Character;
  deleteCharacter: (characterId: string) => void;
}

export default function CharacterCard({ character, deleteCharacter }: CharacterCardProps) {
  return (
    <Card className="overflow-hidden group flex flex-col">
      <CardContent className="p-0 flex-grow">
        <div className="relative aspect-square w-full">
          <Image
            src={character.referenceImageUrl}
            alt={`Reference for ${character.name}`}
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
      <CardFooter className="p-2 flex items-center justify-between bg-muted/50">
        <p className="text-sm font-medium truncate" title={character.name}>{character.name}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Character</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the character "{character.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteCharacter(character.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
