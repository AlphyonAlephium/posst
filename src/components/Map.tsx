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
import { Input } from "@/components/ui/input";

interface Location {
  latitude: number;
  longitude: number;
  user_id: string;
}

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const LATVIA_CENTER = {
    lng: 24.105186,
    lat: 56.946285,
    zoom: 7
  };

  const validateFile = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or PDF file"
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 5MB"
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    } else {
      event.target.value = '';
    }
  };

  const updateLocationSource = async () => {
    if (!map.current) return;

    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations && map.current.getSource('locations')) {
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

      (map.current.getSource('locations') as mapboxgl.GeoJSONSource).setData(geoJson as any);
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
    if (!selectedUserId || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to send"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage in the message_attachments bucket
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create message record
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedUserId,
          file_path: filePath,
          file_name: selectedFile.name,
          file_type: selectedFile.type
        });

      if (messageError) throw messageError;

      toast({
        title: "Success",
        description: "File sent successfully"
      });

      setSelectedFile(null);
      setIsMessageDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send file. Please try again."
      });
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
          // Add a new source with cluster properties
          map.current!.addSource('locations', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Add clusters layer
          map.current!.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'locations',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#FFFFFF',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10, 30,
                20, 40
              ],
              'circle-opacity': 0.8
            }
          });

          // Add cluster count labels with exact color
          map.current!.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'locations',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#7ed957'
            }
          });

          // Add unclustered point layer
          map.current!.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'locations',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#FFFFFF',
              'circle-radius': 15,
              'circle-opacity': 0.8
            }
          });

          // Add unclustered point count with exact color
          map.current!.addLayer({
            id: 'unclustered-point-count',
            type: 'symbol',
            source: 'locations',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'text-field': '1',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#7ed957'
            }
          });

          // Handle clicks on individual points
          map.current!.on('click', 'unclustered-point', (e) => {
            if (e.features && e.features[0].properties) {
              const userId = e.features[0].properties.user_id;
              handleMarkerClick(userId);
            }
          });

          // Updated click handler for clusters with proper type casting
          map.current!.on('click', 'clusters', (e) => {
            const features = map.current!.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            (map.current!.getSource('locations') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
              clusterId,
              (err, zoom) => {
                if (err) return;

                map.current!.easeTo({
                  center: (features[0].geometry as any).coordinates,
                  zoom: zoom
                });
              }
            );
          });

          // Change cursor when hovering over points
          map.current!.on('mouseenter', 'clusters', () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });
          map.current!.on('mouseleave', 'clusters', () => {
            map.current!.getCanvas().style.cursor = '';
          });
          map.current!.on('mouseenter', 'unclustered-point', () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });
          map.current!.on('mouseleave', 'unclustered-point', () => {
            map.current!.getCanvas().style.cursor = '';
          });

          updateLocationSource();
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
              updateLocationSource();
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
            <DialogTitle>Send File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: JPG, PNG, GIF, PDF (Max 5MB)
              </p>
            </div>
            {selectedFile && (
              <p className="text-sm text-primary">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsMessageDialogOpen(false);
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!selectedFile}>
              Send File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
