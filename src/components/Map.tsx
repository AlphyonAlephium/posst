
import React, { useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { SendFileDialog } from './map/SendFileDialog';
import { NearbyUser } from './map/types';
import { useMap } from './map/hooks/useMap';
import { setupMapLayers } from './map/MapLayers';
import { Button } from './ui/button';
import { Navigation } from 'lucide-react';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { map, initializeMap, updateLocationSource, centerOnUserLocation } = useMap();

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMarkerClick = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to send messages"
      });
      return;
    }

    if (user.id === userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot send a message to yourself"
      });
      return;
    }

    setSelectedUserIds([userId]);
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async (companyName: string) => {
    if (selectedUserIds.length === 0 || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one user and a file to send"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totalCost = selectedUserIds.length * 0.10;

      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single() as unknown as { data: { balance: number } | null };

      if (!wallet || wallet.balance < totalCost) {
        throw new Error('Insufficient funds');
      }

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Update wallet balance
      const { error: balanceError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - totalCost } as any)
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: -totalCost,
          description: `Sent file to ${selectedUserIds.length} recipients`
        } as any);

      if (transactionError) throw transactionError;

      // Create message records for each selected user
      const messages = selectedUserIds.map(receiverId => ({
        sender_id: user.id,
        receiver_id: receiverId,
        file_path: filePath,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        company_name: companyName
      }));

      const { error: messageError } = await supabase
        .from('messages')
        .insert(messages);

      if (messageError) throw messageError;

      toast({
        title: "Success",
        description: `File sent to ${selectedUserIds.length} user${selectedUserIds.length > 1 ? 's' : ''} for $${totalCost.toFixed(2)}`
      });

      setSelectedFile(null);
      setSelectedUserIds([]);
      setIsMessageDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error && error.message === 'Insufficient funds'
          ? "Insufficient funds. Please add money to your wallet."
          : "Failed to send file. Please try again."
      });
    }
  };

  const handleCenterOnUserLocation = () => {
    centerOnUserLocation();
  };

  React.useEffect(() => {
    if (!mapContainer.current) return;

    const setupMap = async () => {
      try {
        const mapInstance = await initializeMap(mapContainer.current!);
        
        mapInstance.on('load', () => {
          setupMapLayers(mapInstance);
          updateLocationSource().then(users => {
            setNearbyUsers(users);
          });

          // Handle clicks on individual points
          mapInstance.on('click', 'unclustered-point', (e) => {
            if (e.features && e.features[0].properties) {
              const userId = e.features[0].properties.user_id;
              handleMarkerClick(userId);
            }
          });

          // Handle clicks on clusters
          mapInstance.on('click', 'clusters', (e) => {
            const features = mapInstance.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            (mapInstance.getSource('locations') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
              clusterId,
              (err, zoom) => {
                if (err) return;

                mapInstance.easeTo({
                  center: (features[0].geometry as any).coordinates,
                  zoom: zoom
                });
              }
            );
          });

          // Change cursor when hovering over points
          mapInstance.on('mouseenter', 'clusters', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'clusters', () => {
            mapInstance.getCanvas().style.cursor = '';
          });
          mapInstance.on('mouseenter', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = '';
          });
        });

        const subscription = supabase
          .channel('locations')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'locations' 
            }, 
            () => {
              updateLocationSource().then(users => {
                setNearbyUsers(users);
              });
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
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

  return (
    <>
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={handleCenterOnUserLocation}
            className="bg-white hover:bg-gray-100 shadow-md"
          >
            <Navigation className="h-5 w-5 text-gray-700" />
          </Button>
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
