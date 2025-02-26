
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, User, Store, Filter } from 'lucide-react';

interface MapViewProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  onCenterLocation: () => void;
  filterType: 'all' | 'businesses' | 'users';
  onFilterChange: (type: 'all' | 'businesses' | 'users') => void;
}

export const MapView: React.FC<MapViewProps> = ({ 
  mapContainerRef, 
  onCenterLocation,
  filterType,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
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
      
      <div className="flex items-center justify-center gap-2 mt-3">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className={filterType === 'all' ? 'bg-gray-900 text-white' : ''}
        >
          <Filter className="h-4 w-4 mr-1" />
          All
        </Button>
        <Button
          variant={filterType === 'businesses' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('businesses')}
          className={filterType === 'businesses' ? 'instagram-gradient text-white' : ''}
        >
          <Store className="h-4 w-4 mr-1" />
          Businesses
        </Button>
        <Button
          variant={filterType === 'users' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('users')}
          className={filterType === 'users' ? 'bg-blue-500 text-white' : ''}
        >
          <User className="h-4 w-4 mr-1" />
          Users
        </Button>
      </div>
    </div>
  );
};
