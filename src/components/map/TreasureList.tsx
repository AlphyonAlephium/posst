
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTreasures } from "@/hooks/useTreasures";
import { Compass, CheckCircle, Coins, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { TreasureDialog } from "./TreasureDialog";
import { Treasure } from "./types/treasures";
import { Skeleton } from "@/components/ui/skeleton";

export const TreasureList = () => {
  const { treasures, isLoading, isTreasureFoundByUser, findTreasure } = useTreasures();
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const foundTreasures = treasures.filter(treasure => isTreasureFoundByUser(treasure.id));
  const availableTreasures = treasures.filter(treasure => !isTreasureFoundByUser(treasure.id));

  const handleTreasureClick = (treasure: Treasure) => {
    setSelectedTreasure(treasure);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center gap-1">
            <Compass className="h-4 w-4" />
            <span>Available ({availableTreasures.length})</span>
          </TabsTrigger>
          <TabsTrigger value="found" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>Found ({foundTreasures.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-4 space-y-3">
          {availableTreasures.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Compass className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No treasures available nearby</p>
              <p className="text-xs mt-1">Be the first to hide some treasures!</p>
            </div>
          ) : (
            availableTreasures.map(treasure => (
              <Card 
                key={treasure.id} 
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTreasureClick(treasure)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{treasure.name}</h3>
                    {treasure.description && (
                      <p className="text-gray-500 text-xs truncate">{treasure.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDistanceToNow(new Date(treasure.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center text-xs text-amber-600 font-medium">
                        <Coins className="h-3 w-3 mr-1" />
                        <span>{treasure.reward_amount} coins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="found" className="mt-4 space-y-3">
          {foundTreasures.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">You haven't found any treasures yet</p>
              <p className="text-xs mt-1">Explore the map to discover treasures!</p>
            </div>
          ) : (
            foundTreasures.map(treasure => (
              <Card 
                key={treasure.id} 
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTreasureClick(treasure)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{treasure.name}</h3>
                    {treasure.description && (
                      <p className="text-gray-500 text-xs truncate">{treasure.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{treasure.latitude.toFixed(4)}, {treasure.longitude.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <Coins className="h-3 w-3 mr-1" />
                        <span>+{treasure.reward_amount} coins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <TreasureDialog
        treasure={selectedTreasure}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClaim={findTreasure}
        isClaimed={selectedTreasure ? isTreasureFoundByUser(selectedTreasure.id) : false}
      />
    </>
  );
};
