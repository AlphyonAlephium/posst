
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Map as MapIcon, Coins, ImagePlus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const treasureFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  latitude: z.number({ 
    required_error: "Latitude is required", 
    invalid_type_error: "Latitude must be a number" 
  }),
  longitude: z.number({ 
    required_error: "Longitude is required", 
    invalid_type_error: "Longitude must be a number" 
  }),
  hint: z.string().optional(),
  image_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  reward_amount: z.number().positive({ message: "Reward must be positive" }).default(10),
});

type TreasureFormValues = z.infer<typeof treasureFormSchema>;

interface CreateTreasureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTreasure: (treasure: TreasureFormValues) => Promise<boolean>;
  currentLocation?: { latitude: number; longitude: number } | null;
}

export const CreateTreasureDialog = ({
  isOpen,
  onOpenChange,
  onCreateTreasure,
  currentLocation,
}: CreateTreasureDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TreasureFormValues>({
    resolver: zodResolver(treasureFormSchema),
    defaultValues: {
      name: '',
      description: '',
      latitude: currentLocation?.latitude || 0,
      longitude: currentLocation?.longitude || 0,
      hint: '',
      image_url: '',
      reward_amount: 10,
    },
  });

  // Update form when currentLocation changes
  useState(() => {
    if (currentLocation) {
      form.setValue('latitude', currentLocation.latitude);
      form.setValue('longitude', currentLocation.longitude);
    }
  });

  const onSubmit = async (data: TreasureFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await onCreateTreasure(data);
      if (success) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-amber-500">✨</span> Create New Treasure
          </DialogTitle>
          <DialogDescription>
            Add a new treasure for others to discover in this location.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treasure Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Golden Chalice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the treasure..." 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="hint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hint (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a hint to help others find this treasure..." 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        value={field.value || ''} 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter a URL for an image representing this treasure
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reward_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward Amount</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min="1" 
                        step="1"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        value={field.value}
                      />
                      <Coins className="h-5 w-5 flex-shrink-0 text-amber-500" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Coins rewarded when someone finds this treasure
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="instagram-gradient"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Place Treasure
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
