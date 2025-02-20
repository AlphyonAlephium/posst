
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SendFileActionsProps {
  onClose: () => void;
  onSend: () => void;
  isLoading: boolean;
  disabled: boolean;
  selectedCount: number;
  totalCost: number;
  insufficientFunds: boolean;
}

export const SendFileActions = ({
  onClose,
  onSend,
  isLoading,
  disabled,
  selectedCount,
  totalCost,
  insufficientFunds,
}: SendFileActionsProps) => {
  return (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button 
        onClick={onSend} 
        disabled={disabled}
        className={insufficientFunds ? "bg-destructive hover:bg-destructive/90" : ""}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            Send to {selectedCount} User{selectedCount !== 1 ? 's' : ''} 
            {selectedCount > 0 && ` ($${totalCost.toFixed(2)})`}
          </>
        )}
      </Button>
    </>
  );
};
