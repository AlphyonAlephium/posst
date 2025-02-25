import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { NearbyUser } from '../types';

interface UseMapEventsProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  updateLocationSource: () => Promise<NearbyUser[]>;
  setNearbyUsers: (users: NearbyUser[]) => void;
  handleMarkerClick: (userId: string, feature: any) => void;
}

export const useMapEvents = ({ 
  map, 
  updateLocationSource, 
  setNearbyUsers, 
  handleMarkerClick 
}: UseMapEventsProps) => {
  
  useEffect(() => {
    if (!map.current) return;

    // Handle clicks on individual points
    const handleUnclusteredPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] | undefined }) => {
      if (e.features && e.features[0].properties) {
        const userId = e.features[0].properties.user_id;
        handleMarkerClick(userId, e.features[0]);
      }
    };

    // Handle clicks on clusters
    const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] | undefined }) => {
      if (!map.current) return;
      
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      
      if (!features.length || !features[0].properties) return;
      
      const clusterId = features[0].properties.cluster_id;
      (map.current.getSource('locations') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err || !map.current) return;

          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        }
      );
    };

    // Set up event listeners once map is loaded
    const setupEventListeners = () => {
      if (!map.current) return;
      
      map.current.on('click', 'unclustered-point', handleUnclusteredPointClick);
      map.current.on('click', 'clusters', handleClusterClick);
      
      // Change cursor when hovering over points
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    };

    // Set up data subscriptions
    const setupDataSubscriptions = () => {
      // Location changes subscription
      const locationSubscription = supabase
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

      // Hot deals changes subscription
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
        locationSubscription.unsubscribe();
        hotDealsSubscription.unsubscribe();
      };
    };

    // If map is already loaded, set up listeners
    if (map.current.loaded()) {
      setupEventListeners();
      return setupDataSubscriptions();
    } else {
      // Otherwise wait for map to load first
      const loadHandler = () => {
        setupEventListeners();
      };
      
      map.current.on('load', loadHandler);
      
      const unsubscribe = setupDataSubscriptions();
      
      return () => {
        if (map.current) {
          map.current.off('load', loadHandler);
        }
        unsubscribe();
      };
    }
  }, [map, updateLocationSource, setNearbyUsers, handleMarkerClick]);
};
