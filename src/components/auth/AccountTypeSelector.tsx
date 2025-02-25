
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountTypeSelectorProps {
  onAccountTypeChange: (value: string) => void;
}

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({ onAccountTypeChange }) => {
  return (
    <Tabs defaultValue="individual" className="mb-6" onValueChange={onAccountTypeChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="individual">Individual</TabsTrigger>
        <TabsTrigger value="company">Company/Service</TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <p className="text-sm text-muted-foreground mb-4">
          Register as an individual user to send and receive files.
        </p>
      </TabsContent>
      <TabsContent value="company">
        <p className="text-sm text-muted-foreground mb-4">
          Register as a company or service provider to manage your business presence.
        </p>
      </TabsContent>
    </Tabs>
  );
};
