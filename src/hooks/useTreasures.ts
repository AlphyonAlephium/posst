
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Treasure, TreasureFound } from '@/components/map/types/treasures';

export const useTreasures = () => {
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [foundTreasures, setFoundTreasures] = useState<TreasureFound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTreasures = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('treasures')
        .select('*');

      if (error) {
        throw error;
      }

      setTreasures(data || []);
    } catch (error: any) {
      console.error('Error fetching treasures:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load treasures. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoundTreasures = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('treasures_found')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setFoundTreasures(data || []);
    } catch (error: any) {
      console.error('Error fetching found treasures:', error);
    }
  };

  const findTreasure = async (treasureId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to find treasures"
      });
      return false;
    }

    try {
      // Insert into treasures_found
      const { error } = await supabase
        .from('treasures_found')
        .insert({
          treasure_id: treasureId,
          user_id: user.id
        });

      if (error) {
        // Check if this is a unique constraint error (user already found this treasure)
        if (error.code === '23505') {
          toast({
            title: "Already Found",
            description: "You've already found this treasure!"
          });
          return true;
        }
        throw error;
      }

      // Update user's wallet balance with the reward
      const treasureToFind = treasures.find(t => t.id === treasureId);
      if (treasureToFind) {
        await supabase.rpc('distribute_payment', { 
          sender_id: '00000000-0000-0000-0000-000000000000', // Admin account
          receiver_id: user.id,
          total_amount: treasureToFind.reward_amount 
        });
      }

      // Refresh the lists
      await fetchFoundTreasures();
      
      toast({
        title: "Treasure Found!",
        description: `Congratulations! You found a treasure worth ${treasureToFind?.reward_amount || 0} coins!`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error finding treasure:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record finding the treasure. Please try again."
      });
      return false;
    }
  };

  const createTreasure = async (treasure: Omit<Treasure, 'id' | 'created_at' | 'created_by' | 'is_found'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create treasures"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('treasures')
        .insert({
          ...treasure,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Treasure created successfully!"
      });
      
      // Refresh the treasures list
      fetchTreasures();
      return true;
    } catch (error: any) {
      console.error('Error creating treasure:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create treasure. Please try again."
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTreasures();
    fetchFoundTreasures();

    // Set up realtime subscription for treasures
    const treasuresChannel = supabase
      .channel('treasures-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'treasures' 
        }, 
        () => {
          fetchTreasures();
        }
      )
      .subscribe();

    // Set up realtime subscription for treasures_found
    const treasuresFoundChannel = supabase
      .channel('treasures-found-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'treasures_found' 
        }, 
        () => {
          fetchFoundTreasures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(treasuresChannel);
      supabase.removeChannel(treasuresFoundChannel);
    };
  }, []);

  // Determine if a treasure is found by the current user
  const isTreasureFoundByUser = (treasureId: string) => {
    return foundTreasures.some(ft => ft.treasure_id === treasureId);
  };

  return {
    treasures,
    foundTreasures,
    isLoading,
    findTreasure,
    createTreasure,
    isTreasureFoundByUser,
    refreshTreasures: fetchTreasures
  };
};
