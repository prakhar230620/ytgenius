export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface Asset {
  id: string;
  type: 'background' | 'thumbnail';
  dataUrl: string;
  prompt: string;
  createdAt: string;
  aspectRatio: AspectRatio;
}

export interface Project {
  id:string;
  name: string;
  createdAt: string;
  assets: Asset[];
}
