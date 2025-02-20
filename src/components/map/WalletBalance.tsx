
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, MinusCircle } from "lucide-react";

interface WalletBalanceProps {
  balance: number | null;
  totalCost: number;
  selectedCount: number;
  costPerRecipient: number;
}

export const WalletBalance = ({ 
  balance, 
  totalCost, 
  selectedCount,
  costPerRecipient 
}: WalletBalanceProps) => {
  const handleTopUp = () => {
    console.log("Top up clicked");
  };

  const handleWithdraw = () => {
    console.log("Withdraw clicked");
  };

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="text-sm space-y-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Available Balance:</span>
              <span className="font-medium text-lg">${balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleTopUp}
              >
                <Plus className="h-4 w-4" />
                Top up
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleWithdraw}
              >
                <MinusCircle className="h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-primary">
          <span>Cost per recipient:</span>
          <span>${costPerRecipient.toFixed(2)}</span>
        </div>
        <div className="text-xs text-muted-foreground italic">
          50% of the fee goes to recipients
        </div>
        {selectedCount > 0 && (
          <div className="flex justify-between font-medium border-t pt-2 mt-2">
            <span>Total cost ({selectedCount} recipients):</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
