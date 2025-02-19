
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-background/80 backdrop-blur-lg border-b z-50">
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
      <h1 className="text-xl font-semibold">Uber</h1>
      <Button variant="ghost" size="icon">
        <User className="h-6 w-6" />
      </Button>
    </header>
  );
};
