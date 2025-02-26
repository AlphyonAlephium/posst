
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface MapViewProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  onCenterLocation: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ 
  mapContainerRef, 
  onCenterLocation 
}) => {
  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0" />
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={onCenterLocation}
          className="bg-white hover:bg-gray-100 shadow-md"
        >
          <Navigation className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
    </div>
  );
};
