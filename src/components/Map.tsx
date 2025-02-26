
import React, { useRef, useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NearbyUser } from './map/types';
import { useMap } from './map/hooks/useMap';
import { useMarkerClick } from './map/hooks/useMarkerClick';
import { useFileSender } from './map/hooks/useFileSender';
import { useMapSetup } from './map/hooks/useMapSetup';
import { MapView } from './map/MapView';
import { SendFileDialog } from './map/SendFileDialog';
import { useTreasures } from '@/hooks/useTreasures';
import { TreasureDialog } from './map/TreasureDialog';
import { CreateTreasureDialog } from './map/CreateTreasureDialog';
import { Treasure } from './map/types/treasures';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Map as MapIcon } from 'lucide-react';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [isTreasureDialogOpen, setIsTreasureDialogOpen] = useState(false);
  const [isCreateTreasureDialogOpen, setIsCreateTreasureDialogOpen] = useState(false);
  
  const { 
    map, 
    initializeMap, 
    updateLocationSource, 
    centerOnUserLocation 
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

  const {
    treasures,
    findTreasure,
    createTreasure,
    isTreasureFoundByUser,
    isLoading: treasuresLoading
  } = useTreasures();

  // Set up map and event listeners
  useMapSetup(
    map,
    mapContainer,
    initializeMap,
    updateLocationSource,
    setNearbyUsers,
    handleMarkerClick
  );

  // Update treasures on the map
  useEffect(() => {
    if (!map.current) return;

    const source = map.current.getSource('treasures') as mapboxgl.GeoJSONSource;
    if (!source) return;

    const geoJson = {
      type: 'FeatureCollection',
      features: treasures.map(treasure => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [treasure.longitude, treasure.latitude]
        },
        properties: {
          id: treasure.id,
          name: treasure.name,
          is_found: isTreasureFoundByUser(treasure.id)
        }
      }))
    };

    source.setData(geoJson as any);
  }, [treasures, map.current]);

  // Handle treasure marker clicks
  useEffect(() => {
    if (!map.current) return;

    const handleTreasureClick = (e: mapboxgl.MapMouseEvent) => {
      if (!e.features || !e.features[0] || !e.features[0].properties) return;
      
      const treasureId = e.features[0].properties.id;
      const treasure = treasures.find(t => t.id === treasureId);
      
      if (treasure) {
        setSelectedTreasure(treasure);
        setIsTreasureDialogOpen(true);
      }
    };

    map.current.on('click', 'treasures-markers', handleTreasureClick);

    return () => {
      if (map.current) {
        map.current.off('click', 'treasures-markers', handleTreasureClick);
      }
    };
  }, [map.current, treasures]);

  // Track current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('locations')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCurrentLocation({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    };

    getCurrentLocation();
  }, []);

  const handleCenterOnUserLocation = () => {
    centerOnUserLocation();
  };

  const handleCreateTreasure = async (treasureData: any) => {
    const result = await createTreasure(treasureData);
    return result;
  };

  const handleClaimTreasure = async (treasureId: string) => {
    return findTreasure(treasureId);
  };

  return (
    <>
      <div className="relative">
        <MapView 
          mapContainerRef={mapContainer} 
          onCenterLocation={handleCenterOnUserLocation} 
        />
        
        {/* Treasure creation button */}
        <Button
          variant="default"
          size="sm"
          className="absolute bottom-4 right-4 z-10 bg-amber-500 hover:bg-amber-600"
          onClick={() => setIsCreateTreasureDialogOpen(true)}
        >
          <MapIcon className="mr-2 h-4 w-4" />
          Hide Treasure
        </Button>
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

      <TreasureDialog
        treasure={selectedTreasure}
        isOpen={isTreasureDialogOpen}
        onOpenChange={setIsTreasureDialogOpen}
        onClaim={handleClaimTreasure}
        isClaimed={selectedTreasure ? isTreasureFoundByUser(selectedTreasure.id) : false}
      />

      <CreateTreasureDialog
        isOpen={isCreateTreasureDialogOpen}
        onOpenChange={setIsCreateTreasureDialogOpen}
        onCreateTreasure={handleCreateTreasure}
        currentLocation={currentLocation}
      />
    </>
  );
};
