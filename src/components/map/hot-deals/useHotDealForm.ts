
import { useState, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { validateHotDealForm, MAX_DURATION } from './validators';
import { uploadHotDealImage, createHotDeal } from './hotDealService';

export const useHotDealForm = (onSuccess: () => void) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { userId, userName } = useUserProfile();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setDuration(1);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateHotDealForm(title, description, startTime, duration, selectedFile);
    
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: validation.errorMessage
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload image and get URL
      const imageUrl = await uploadHotDealImage(selectedFile as File);
      
      // Create hot deal
      await createHotDeal(
        userId as string,
        userName || 'Unknown Company',
        title,
        description,
        startTime,
        duration,
        imageUrl
      );

      toast({
        title: "Success!",
        description: "Your hot deal has been created"
      });

      // Reset form and close dialog
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error creating hot deal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create hot deal. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    startTime,
    setStartTime,
    duration,
    setDuration,
    isLoading,
    selectedFile,
    fileInputRef,
    handleFileSelect,
    handleSubmit,
    MAX_DURATION
  };
};
