"use client";

import { type Asset } from '@/types';
import AssetCard from './AssetCard';

interface AssetGridProps {
  assets: Asset[];
  deleteAsset: (assetId: string) => void;
  togglePreference?: (assetId: string) => void;
  preferenceCount?: number;
  maxPreferences?: number;
}

export default function AssetGrid({ assets, deleteAsset, togglePreference, preferenceCount, maxPreferences }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg mt-8">
        <h3 className="font-headline text-xl font-semibold text-muted-foreground">No assets yet!</h3>
        <p className="text-muted-foreground mt-2">Generate a background or thumbnail to see it here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="font-headline text-2xl font-bold mb-4">Generated Assets</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              deleteAsset={deleteAsset} 
              togglePreference={togglePreference}
              preferenceCount={preferenceCount}
              maxPreferences={maxPreferences}
            />
        ))}
      </div>
    </div>
  );
}
