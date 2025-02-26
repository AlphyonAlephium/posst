
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Treasure } from './types/treasures';
import { Loader2, Map as MapIcon, Coins } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface TreasureDialogProps {
  treasure: Treasure | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClaim: (treasureId: string) => Promise<boolean>;
  isClaimed: boolean;
  isLoadingClaim?: boolean;
}

export const TreasureDialog = ({
  treasure,
  isOpen,
  onOpenChange,
  onClaim,
  isClaimed,
  isLoadingClaim = false
}: TreasureDialogProps) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!treasure) return;
    
    setClaiming(true);
    try {
      await onClaim(treasure.id);
    } finally {
      setClaiming(false);
    }
  };

  if (!treasure) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-amber-500">✨</span> {treasure.name}
          </DialogTitle>
          <DialogDescription>
            {isClaimed ? 'You have already found this treasure!' : 'You discovered a hidden treasure!'}
          </DialogDescription>
        </DialogHeader>
        
        {treasure.image_url && (
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
            <img
              src={treasure.image_url}
              alt={treasure.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </AspectRatio>
        )}
        
        <div className="space-y-3">
          {treasure.description && (
            <p className="text-sm text-gray-700">{treasure.description}</p>
          )}
          
          {!isClaimed && treasure.hint && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Hint:</span> {treasure.hint}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapIcon className="h-4 w-4" />
            <span>
              Located at {treasure.latitude.toFixed(6)}, {treasure.longitude.toFixed(6)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
            <Coins className="h-4 w-4" />
            <span>Reward: {treasure.reward_amount} coins</span>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          
          {!isClaimed && (
            <Button
              onClick={handleClaim}
              disabled={claiming || isLoadingClaim}
              className="instagram-gradient"
            >
              {(claiming || isLoadingClaim) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Claim Treasure
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
