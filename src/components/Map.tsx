
import React, { useRef, useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NearbyUser } from './map/types';
import { useMap } from './map/hooks/useMap';
import { useMarkerClick } from './map/hooks/useMarkerClick';
import { useFileSender } from './map/hooks/useFileSender';
import { useMapSetup } from './map/hooks/useMapSetup';
import { MapView } from './map/MapView';
import { SendFileDialog } from './map/SendFileDialog';
import { MapFilter } from './map/MapFilter';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [showUsers, setShowUsers] = useState<boolean>(true);
  const [showBusinesses, setShowBusinesses] = useState<boolean>(true);
  
  const { 
    map, 
    initializeMap, 
    updateLocationSource, 
    centerOnUserLocation,
    applyVisibilityFilter 
  } = useMap();
  
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

  // Apply visibility filters whenever they change
  useEffect(() => {
    if (map.current) {
      applyVisibilityFilter(showUsers, showBusinesses);
    }
  }, [showUsers, showBusinesses, map.current]);

  const handleFilterChange = (filterType: 'users' | 'businesses', value: boolean) => {
    if (filterType === 'users') {
      setShowUsers(value);
    } else {
      setShowBusinesses(value);
    }
  };

  return (
    <>
      <MapView 
        mapContainerRef={mapContainer} 
        onCenterLocation={handleCenterOnUserLocation} 
      />

      <div className="mt-2">
        <MapFilter
          showUsers={showUsers}
          showBusinesses={showBusinesses}
          onFilterChange={handleFilterChange}
        />
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
