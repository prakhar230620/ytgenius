export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface Asset {
  id: string;
  type: 'background' | 'thumbnail';
  dataUrl: string;
  prompt: string;
  createdAt: string;
  aspectRatio: AspectRatio;
}

export interface Character {
  id: string;
  name: string;
  referenceImageUrl: string;
  createdAt: string;
}

export interface Project {
  id:string;
  name: string;
  createdAt: string;
  assets: Asset[];
  characters: Character[];
}
