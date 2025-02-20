
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  // Fetch and display all locations
  const fetchLocations = async () => {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*');

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    // Add new markers for each location
    if (locations) {
      const newMarkers = locations.map(location => {
        const marker = new mapboxgl.Marker()
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current!);
        return marker;
      });
      setMarkers(newMarkers);
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

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
      map.current?.remove();
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
