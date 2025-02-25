
import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { fetchActiveHotDeals, deleteHotDeal } from './hotDealService';
import type { HotDeal } from "../types";
import { format } from 'date-fns';

interface ActiveHotDealsProps {
  onDelete: () => void;
}

export const ActiveHotDeals = ({ onDelete }: ActiveHotDealsProps) => {
  const [deals, setDeals] = useState<HotDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const activeDeals = await fetchActiveHotDeals();
      setDeals(activeDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your active deals."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteHotDeal(id);
      toast({
        title: "Success",
        description: "Hot deal deleted successfully"
      });
      loadDeals();
      onDelete();
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the hot deal."
      });
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading your active deals...</div>;
  }

  if (deals.length === 0) {
    return <div className="py-4 text-center text-gray-500">You don't have any active hot deals.</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold text-lg">Your Active Hot Deals</h3>
      <div className="space-y-3">
        {deals.map((deal) => (
          <div 
            key={deal.id} 
            className="flex items-start justify-between p-3 bg-background border rounded-md shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-md truncate">{deal.title}</h4>
              <p className="text-sm text-gray-500 truncate">{deal.description}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  {format(new Date(deal.start_time), 'MMM d, h:mm a')}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {deal.duration_hours}h
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(deal.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
