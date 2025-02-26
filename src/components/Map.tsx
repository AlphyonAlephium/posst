
import React, { useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NearbyUser, MapFilter } from './map/types';
import { useMap } from './map/hooks/useMap';
import { useMarkerClick } from './map/hooks/useMarkerClick';
import { useFileSender } from './map/hooks/useFileSender';
import { useMapSetup } from './map/hooks/useMapSetup';
import { MapView } from './map/MapView';
import { SendFileDialog } from './map/SendFileDialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [filter, setFilter] = useState<MapFilter>({
    showBusinesses: true,
    showUsers: true,
  });
  
  const { map, initializeMap, updateLocationSource, centerOnUserLocation } = useMap(filter);
  const { 
    isMessageDialogOpen, 
    setIsMessageDialogOpen, 
    selectedUserIds, 
    setSelectedUserIds, 
    handleMarkerClick 
  } = useMarkerClick();
  
  const { 
    selectedFile, 
    setSelectedFile, 
    fileInputRef, 
    handleSendMessage 
  } = useFileSender(selectedUserIds, setSelectedUserIds, setIsMessageDialogOpen);

  // Set up map and event listeners
  useMapSetup(
    map,
    mapContainer,
    initializeMap,
    updateLocationSource,
    setNearbyUsers,
    handleMarkerClick
  );

  const handleCenterOnUserLocation = () => {
    centerOnUserLocation();
  };

  const handleFilterChange = (key: keyof MapFilter) => (checked: boolean) => {
    console.log(`Setting ${key} filter to: ${checked}`);
    setFilter(prev => {
      const newFilter = { ...prev, [key]: checked };
      console.log('New filter state:', newFilter);
      return newFilter;
    });
  };

  return (
    <>
      <div className="relative">
        <MapView 
          mapContainerRef={mapContainer} 
          onCenterLocation={handleCenterOnUserLocation} 
        />
        
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-md">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-businesses" 
                checked={filter.showBusinesses}
                onCheckedChange={handleFilterChange('showBusinesses')}
              />
              <Label htmlFor="show-businesses">Show Businesses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-users" 
                checked={filter.showUsers}
                onCheckedChange={handleFilterChange('showUsers')}
              />
              <Label htmlFor="show-users">Show Regular Users</Label>
            </div>
          </div>
        </div>
      </div>

      <SendFileDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        nearbyUsers={nearbyUsers}
        selectedUserIds={selectedUserIds}
        onUserSelect={setSelectedUserIds}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onSend={handleSendMessage}
        fileInputRef={fileInputRef}
      />
    </>
  );
};
