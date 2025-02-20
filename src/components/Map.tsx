
import React, { useEffect, useRef, useState } from 'react';
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
  const [mapboxToken, setMapboxToken] = useState('');
  const { toast } = useToast();

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
      // Remove markers that are no longer in the locations data
      Object.keys(markersRef.current).forEach(userId => {
        if (!locations.find(loc => loc.user_id === userId)) {
          markersRef.current[userId].remove();
          delete markersRef.current[userId];
        }
      });

      // Update or add markers for each location
      locations.forEach(location => {
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
          markersRef.current[location.user_id] = new mapboxgl.Marker()
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup)
            .addTo(map.current);
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
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Fetch locations when map is loaded
    map.current.on('load', fetchLocations);

    // Set up real-time subscription for new locations
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

    // Cleanup
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      map.current?.remove();
      subscription.unsubscribe();
    };
  }, [mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="p-4 text-center">
        <input
          type="text"
          placeholder="Enter your Mapbox public token"
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setMapboxToken(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Enter your Mapbox public token to view the map. Get one at mapbox.com
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};
