
import React, { useRef, useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { SendFileDialog } from './map/SendFileDialog';
import { NearbyUser, HotDeal, HotDealPopupInfo } from './map/types';
import { useMap } from './map/hooks/useMap';
import { setupMapLayers } from './map/MapLayers';
import { HotDealPopup } from './map/HotDealPopup';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { map, initializeMap, updateLocationSource } = useMap();
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeHotDeal, setActiveHotDeal] = useState<HotDealPopupInfo | null>(null);

  // Function to handle when a marker with an active hot deal is clicked
  const handleHotDealMarkerClick = (dealData: HotDealPopupInfo) => {
    setActiveHotDeal(dealData);
    
    if (popupRef.current) {
      popupRef.current.remove();
    }

    if (map.current) {
      popupRef.current = new mapboxgl.Popup({ closeButton: false, maxWidth: '300px' })
        .setLngLat(dealData.coordinates)
        .setDOMContent(document.createElement('div')) // Temporary div that will be replaced with React content
        .addTo(map.current);
    }
  };

  const handleClosePopup = () => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    setActiveHotDeal(null);
  };

  const handleMarkerClick = async (userId: string, feature: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if this marker has an active hot deal
    if (feature.properties.has_active_deal) {
      // Create hot deal object from feature properties
      const deal: HotDeal = {
        id: feature.properties.deal_id,
        user_id: userId,
        company_name: feature.properties.company_name,
        title: feature.properties.deal_title,
        description: feature.properties.deal_description,
        image_url: feature.properties.deal_image_url,
        start_time: feature.properties.deal_start_time,
        duration_hours: feature.properties.deal_duration_hours,
        created_at: ''
      };
      
      // Pass coordinates and deal to the handler
      handleHotDealMarkerClick({
        deal,
        coordinates: feature.geometry.coordinates
      });
      return;
    }

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
              handleMarkerClick(userId, e.features[0]);
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

        // Also listen for hot deals changes to update markers
        const hotDealsSubscription = supabase
          .channel('hot_deals')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'hot_deals' 
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
          hotDealsSubscription.unsubscribe();
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

  // Create React portal for popup content when activeHotDeal changes
  useEffect(() => {
    if (activeHotDeal && popupRef.current) {
      const popupContainer = popupRef.current.getElement();
      const contentDiv = popupContainer.querySelector('.mapboxgl-popup-content');
      
      if (contentDiv && activeHotDeal.deal) {
        // Clear any existing content
        while (contentDiv.firstChild) {
          contentDiv.removeChild(contentDiv.firstChild);
        }
        
        // Create a div to render our React component into
        const hotDealContainer = document.createElement('div');
        contentDiv.appendChild(hotDealContainer);
        
        // Use ReactDOM to render the component into the container
        const root = document.createElement('div');
        hotDealContainer.appendChild(root);
        
        // Create HotDealPopup component manually since we can't use JSX here
        const popupElement = document.createElement('div');
        popupElement.className = "bg-white rounded-lg shadow-lg overflow-hidden w-64";
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = "relative";
        
        // Create image
        const img = document.createElement('img');
        img.src = activeHotDeal.deal.image_url;
        img.alt = activeHotDeal.deal.title;
        img.className = "w-full h-32 object-cover";
        imageContainer.appendChild(img);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = "absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity";
        closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeButton.onclick = handleClosePopup;
        imageContainer.appendChild(closeButton);
        
        // Check if deal is active
        const startTime = new Date(activeHotDeal.deal.start_time);
        const endTime = new Date(startTime.getTime() + activeHotDeal.deal.duration_hours * 60 * 60 * 1000);
        const isActive = new Date() >= startTime && new Date() <= endTime;
        
        if (isActive) {
          const activeTag = document.createElement('div');
          activeTag.className = "absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-md";
          activeTag.textContent = "Active Now!";
          imageContainer.appendChild(activeTag);
        }
        
        popupElement.appendChild(imageContainer);
        
        // Create content div
        const content = document.createElement('div');
        content.className = "p-3";
        
        // Title
        const title = document.createElement('h3');
        title.className = "font-bold text-lg truncate";
        title.textContent = activeHotDeal.deal.title;
        content.appendChild(title);
        
        // Company name
        const company = document.createElement('p');
        company.className = "text-sm text-gray-600 mb-2";
        company.textContent = activeHotDeal.deal.company_name;
        content.appendChild(company);
        
        // Description
        const description = document.createElement('p');
        description.className = "text-sm line-clamp-3";
        description.textContent = activeHotDeal.deal.description;
        content.appendChild(description);
        
        // Time info
        const timeInfo = document.createElement('div');
        timeInfo.className = "mt-2 text-xs text-gray-500";
        
        const timeText = document.createElement('p');
        if (isActive) {
          timeText.textContent = `Ends at ${endTime.toLocaleTimeString()}`;
        } else {
          timeText.textContent = `Starts at ${startTime.toLocaleTimeString()}`;
        }
        timeInfo.appendChild(timeText);
        
        content.appendChild(timeInfo);
        popupElement.appendChild(content);
        
        root.appendChild(popupElement);
      }
    }
  }, [activeHotDeal]);

  return (
    <>
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />
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
