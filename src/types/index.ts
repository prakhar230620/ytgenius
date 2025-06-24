export interface Asset {
  id: string;
  type: 'background' | 'thumbnail';
  dataUrl: string;
  prompt: string;
  createdAt: string;
}

export interface Project {
  id:string;
  name: string;
  createdAt: string;
  assets: Asset[];
}
