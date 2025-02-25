
import React, { useRef, useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from "@/components/ui/use-toast";
import { SendFileDialog } from './map/SendFileDialog';
import { NearbyUser } from './map/types';
import { useMap } from './map/hooks/useMap';
import { setupMapLayers } from './map/MapLayers';
import { useMapMarkers } from './map/hooks/useMapMarkers';
import { useMessageSender } from './map/hooks/useMessageSender';
import { useMapEvents } from './map/hooks/useMapEvents';
import { MapHotDealPopup } from './map/MapHotDealPopup';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { map, initializeMap, updateLocationSource } = useMap();
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);

  // Map markers and popup state management
  const {
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    selectedUserIds,
    setSelectedUserIds,
    activeHotDeal,
    handleMarkerClick,
    handleClosePopup
  } = useMapMarkers();

  // Message sending functionality
  const {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    handleSendMessage
  } = useMessageSender();

  // Initialize map and set up event handlers
  useEffect(() => {
    if (!mapContainer.current) return;

    const setupMap = async () => {
      try {
        const mapInstance = await initializeMap(mapContainer.current!);
        
        mapInstance.on('load', () => {
          setupMapLayers(mapInstance);
          updateLocationSource().then(users => {
            setNearbyUsers(users);
          });
        });

        return () => {
          map.current?.remove();
        };
      } catch (error) {
        console.error('Error in setupMap:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize map. Please try again later."
        });
      }
    };

    setupMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  // Set up map event handlers and data subscriptions
  useMapEvents({
    map,
    updateLocationSource,
    setNearbyUsers,
    handleMarkerClick
  });

  // Handler for sending messages through the dialog
  const onSendMessage = async (companyName: string) => {
    const success = await handleSendMessage(selectedUserIds, companyName);
    if (success) {
      setSelectedUserIds([]);
      setIsMessageDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>

      {/* Hot Deal Popup */}
      <MapHotDealPopup
        activeHotDeal={activeHotDeal}
        map={map}
        onClose={handleClosePopup}
      />

      {/* Message Dialog */}
      <SendFileDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        nearbyUsers={nearbyUsers}
        selectedUserIds={selectedUserIds}
        onUserSelect={setSelectedUserIds}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onSend={onSendMessage}
        fileInputRef={fileInputRef}
      />
    </>
  );
};
