
import { useEffect } from 'react';
import { setupMapLayers } from '../MapLayers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { NearbyUser } from '../types';

export const useMapSetup = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapContainer: React.RefObject<HTMLDivElement>,
  initializeMap: (containerRef: HTMLDivElement) => Promise<mapboxgl.Map>,
  updateLocationSource: () => Promise<NearbyUser[]>,
  setNearbyUsers: (users: NearbyUser[]) => void,
  handleMarkerClick: (userId: string, isCompany?: boolean) => void
) => {
  const { toast } = useToast();

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

          // Handle clicks on individual user points
          mapInstance.on('click', 'unclustered-point', (e) => {
            if (e.features && e.features[0].properties) {
              const userId = e.features[0].properties.user_id;
              const isCompany = false; // Regular user points
              handleMarkerClick(userId, isCompany);
            }
          });
          
          // Handle clicks on business points
          mapInstance.on('click', 'business-point', (e) => {
            if (e.features && e.features[0].properties) {
              const userId = e.features[0].properties.user_id;
              const isCompany = true; // Business points
              handleMarkerClick(userId, isCompany);
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
          mapInstance.on('mouseenter', 'business-point', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'business-point', () => {
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
};
