
import { Car, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RideOption {
  id: string;
  name: string;
  price: string;
  time: string;
  type: string;
}

const rideOptions: RideOption[] = [
  {
    id: "1",
    name: "UberX",
    price: "$18-22",
    time: "4 min",
    type: "Regular",
  },
  {
    id: "2",
    name: "Uber Black",
    price: "$45-50",
    time: "8 min",
    type: "Premium",
  },
  {
    id: "3",
    name: "Uber XL",
    price: "$28-32",
    time: "6 min",
    type: "Large",
  },
];

export const RideOptions = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Choose a ride</h2>
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {rideOptions.map((option) => (
          <Card
            key={option.id}
            className="p-4 hover:bg-accent transition-colors cursor-pointer border-2 hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Car className="h-8 w-8" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{option.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {option.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.time} away</p>
                </div>
              </div>
              <span className="font-semibold">{option.price}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
