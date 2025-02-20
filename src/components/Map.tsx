
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
import { AlertCircle } from "lucide-react";

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
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
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

      // Upload file to storage
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
