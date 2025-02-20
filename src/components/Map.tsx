
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface UserLocation {
  latitude: number;
  longitude: number;
  profiles: {
    email: string;
  } | null;
}

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { toast } = useToast();

  // Latvia's coordinates (centered on Riga)
  const LATVIA_CENTER = {
    lng: 24.105186,
    lat: 56.946285,
    zoom: 7
  };

  // Fetch and display all locations
  const fetchLocations = async () => {
    const { data: locations, error } = await supabase
      .from('locations')
      .select(`
        latitude,
        longitude,
        user_id,
        profiles (
          email
        )
      `) as { data: (UserLocation & { user_id: string })[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations && map.current) {
      console.log('Fetched locations:', locations);

      // Remove markers that are no longer in the locations data
      Object.keys(markersRef.current).forEach(userId => {
        if (!locations.find(loc => loc.user_id === userId)) {
          markersRef.current[userId].remove();
          delete markersRef.current[userId];
        }
      });

      // Update or add markers for each location
      locations.forEach(location => {
        console.log('Processing location:', location);

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <p class="font-semibold">${location.profiles?.email || 'Anonymous User'}</p>
            </div>
          `);

        if (markersRef.current[location.user_id]) {
          // Update existing marker position
          markersRef.current[location.user_id]
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup);
        } else {
          // Create new marker
          markersRef.current[location.user_id] = new mapboxgl.Marker({
            color: '#FF0000' // Make markers red for better visibility
          })
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup)
            .addTo(map.current);
          
          console.log('Created new marker for user:', location.user_id);
        }
      });

      // Fit map to show all markers if there are any locations
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

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Wait for map to load before fetching locations
        map.current.on('load', () => {
          console.log('Map loaded, fetching locations...');
          fetchLocations();
        });

        // Set up real-time subscription for new locations
        const subscription = supabase
          .channel('locations')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'locations' 
            }, 
            (payload) => {
              console.log('Real-time update received:', payload);
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

    // Cleanup
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};
