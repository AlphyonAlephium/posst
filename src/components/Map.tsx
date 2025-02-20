import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Location {
  latitude: number;
  longitude: number;
  user_id: string;
}

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { toast } = useToast();

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');

  const LATVIA_CENTER = {
    lng: 24.105186,
    lat: 56.946285,
    zoom: 7
  };

  const fetchLocations = async () => {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations && map.current) {
      Object.keys(markersRef.current).forEach(userId => {
        if (!locations.find(loc => loc.user_id === userId)) {
          markersRef.current[userId].remove();
          delete markersRef.current[userId];
        }
      });

      locations.forEach(location => {
        if (markersRef.current[location.user_id]) {
          markersRef.current[location.user_id]
            .setLngLat([location.longitude, location.latitude]);
        } else {
          const marker = new mapboxgl.Marker({
            color: '#FF0000'
          })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map.current!);

          marker.getElement().addEventListener('click', () => {
            handleMarkerClick(location.user_id);
          });

          markersRef.current[location.user_id] = marker;
        }
      });

      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
          bounds.extend([location.longitude, location.latitude]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  };

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

    setSelectedUserId(userId);
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageContent.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          receiver_id: selectedUserId,
          content: messageContent.trim()
        }
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      });
    } else {
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
      setMessageContent('');
      setIsMessageDialogOpen(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const { data: { MAPBOX_PUBLIC_TOKEN }, error } = await supabase
          .functions.invoke('get-secret', {
            body: { secretName: 'MAPBOX_PUBLIC_TOKEN' }
          });

        if (error || !MAPBOX_PUBLIC_TOKEN) {
          throw new Error('Failed to get Mapbox token');
        }

        mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [LATVIA_CENTER.lng, LATVIA_CENTER.lat],
          zoom: LATVIA_CENTER.zoom
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          fetchLocations();
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
              fetchLocations();
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize map. Please try again later."
        });
      }
    };

    initializeMap();

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      map.current?.remove();
    };
  }, []);

  return (
    <>
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Type your message here..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
