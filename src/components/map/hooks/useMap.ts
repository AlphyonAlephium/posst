
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return;

    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations) {
      const geoJson = {
        type: 'FeatureCollection',
        features: locations.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id
          }
        }))
      };

      // Check if the source already exists before setting data
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locations.map(loc => ({ user_id: loc.user_id! }));
    }
    return [];
  };

  const showUserLocation = () => {
    if (!map.current) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Add a blue dot for the user's current location
          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }

          // Create a pulsing dot element
          const el = document.createElement('div');
          el.className = 'user-location-marker';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'rgba(37, 99, 235, 0.5)'; // Blue color with transparency
          el.style.border = '3px solid rgba(37, 99, 235, 1)';
          el.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.8)';
          el.style.animation = 'pulse 2s infinite';

          // Add the animation style to the document if it doesn't exist
          if (!document.getElementById('user-location-pulse')) {
            const style = document.createElement('style');
            style.id = 'user-location-pulse';
            style.innerHTML = `
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }
            `;
            document.head.appendChild(style);
          }

          // Create the marker
          userLocationMarker.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current!);

          // Fly to user's location with animation
          map.current!.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            speed: 1.5,
            curve: 1,
            essential: true
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const initializeMap = async (containerRef: HTMLDivElement) => {
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
        container: containerRef,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [LATVIA_CENTER.lng, LATVIA_CENTER.lat],
        zoom: LATVIA_CENTER.zoom
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return map.current;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  };

  return {
    map,
    initializeMap,
    updateLocationSource,
    showUserLocation
  };
};
