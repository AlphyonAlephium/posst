
import React, { useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NearbyUser } from './map/types';
import { useMap } from './map/hooks/useMap';
import { useMarkerClick } from './map/hooks/useMarkerClick';
import { useFileSender } from './map/hooks/useFileSender';
import { useMapSetup } from './map/hooks/useMapSetup';
import { MapView } from './map/MapView';
import { SendFileDialog } from './map/SendFileDialog';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  
  const { map, initializeMap, updateLocationSource, centerOnUserLocation } = useMap();
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

  return (
    <>
      <MapView 
        mapContainerRef={mapContainer} 
        onCenterLocation={handleCenterOnUserLocation} 
      />

      <SendFileDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        nearbyUsers={nearbyUsers.filter(user => !user.is_company)} // Filter out business users for sending files
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
