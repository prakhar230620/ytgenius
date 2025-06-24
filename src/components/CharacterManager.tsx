"use client";

import { useState, useRef } from 'react';
import { type Character } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, UserPlus } from 'lucide-react';
import Image from 'next/image';
import CharacterCard from './CharacterCard';

interface CharacterManagerProps {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => void;
  deleteCharacter: (characterId: string) => void;
}

export function CharacterManager({ characters, addCharacter, deleteCharacter }: CharacterManagerProps) {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterImage, setNewCharacterImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCharacterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCharacterName.trim() && newCharacterImage) {
      addCharacter({ name: newCharacterName.trim(), referenceImageUrl: newCharacterImage });
      setNewCharacterName('');
      setNewCharacterImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><UserPlus /> Add New Character</CardTitle>
          <CardDescription>Upload a clear reference image of a character to maintain their appearance across generated images.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCharacter} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="char-name">Character Name</Label>
                <Input
                  id="char-name"
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  placeholder="e.g., Captain Alex"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="char-image">Reference Image</Label>
                 {newCharacterImage ? (
                    <div className="mt-2 relative w-32 h-32">
                        <Image src={newCharacterImage} alt="Character preview" fill className="rounded-md object-cover" />
                    </div>
                ) : <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">Image Preview</div>}
                <Input
                  id="char-image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputRef}
                  required
                  className="mt-2"
                />
              </div>
            </div>
            <Button type="submit" disabled={!newCharacterName.trim() || !newCharacterImage}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Save Character
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Saved Characters</h3>
        {characters.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="font-headline text-xl font-semibold text-muted-foreground">No characters saved yet!</h3>
            <p className="text-muted-foreground mt-2">Add a character above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map(character => (
              <CharacterCard key={character.id} character={character} deleteCharacter={deleteCharacter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
