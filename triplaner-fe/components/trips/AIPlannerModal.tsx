import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Chat, ChatMessage } from '@/components/ui/chat';
import { openaiService, tripService, activityService } from '@/services';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, MapPin, Calendar, Plane } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AIPlannerModal({ isOpen, onClose, onSuccess }: AIPlannerModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: "👋 Hi there! I'm your AI Trip Planner. I can help create a personalized itinerary based on your preferences.\n\nJust tell me your destination, how long you'll be staying, and what interests you. For example: \"Plan a 5-day trip to Goa with beach activities and local cuisine exploration\"",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (content: string) => {
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get response from OpenAI
      const response = await openaiService.planTrip(content);
      
      // Add AI response to chat
      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        // Show confirm button after AI has suggested a plan
        setShowConfirm(true);
      }
    } catch (error) {
      console.error('Error getting trip suggestion:', error);
      toast({
        title: 'Error',
        description: "Failed to get trip suggestion. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPlan = async () => {
    setIsLoading(true);
    
    try {
      // Prepare conversation context for JSON generation
      const conversation = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
      
      // Add instruction for formatting
      const promptWithFormat = conversation + '\n\nPlease convert the above trip plan into a structured JSON format.';
      
      // Get JSON from OpenAI
      const jsonResponse = await openaiService.generateTripJson(promptWithFormat);
      
      if (jsonResponse.success && jsonResponse.data) {
        // Parse the JSON from the content
        const contentStr = jsonResponse.data.content;
        
        // Try to parse the JSON directly first
        try {
          // If response_format was used, the content should already be valid JSON
          const tripData = JSON.parse(contentStr);
          
          if (tripData && tripData.trip) {
            await createTripFromData(tripData);
          } else {
            throw new Error("Invalid trip data structure");
          }
        } catch (parseError) {
          // If direct parsing failed, try to extract JSON from markdown
          try {
            // Extract JSON object from the string (handle potential markdown code blocks)
            const jsonMatch = contentStr.match(/```json\s*([\s\S]*?)\s*```/) || contentStr.match(/```\s*([\s\S]*?)\s*```/) || [null, contentStr];
            const jsonStr = jsonMatch[1] || contentStr;
            
            // Clean up any potential markdown or extra text
            const cleanJsonStr = jsonStr.trim();
            
            const tripData = JSON.parse(cleanJsonStr);
            
            if (tripData && tripData.trip) {
              await createTripFromData(tripData);
            } else {
              throw new Error("Invalid trip data structure after cleanup");
            }
          } catch (extractError) {
            console.error("Failed to extract and parse JSON:", extractError);
            toast({
              title: 'Error',
              description: "Failed to parse the trip data. Please try again.",
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error creating trip from AI plan:', error);
      toast({
        title: 'Error',
        description: "Failed to create trip. Please try again or create manually.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create trip from parsed data
  const createTripFromData = async (tripData: any) => {
    try {
      // Validate trip data structure
      if (!tripData.trip.destination || !tripData.trip.startDate || !tripData.trip.endDate) {
        throw new Error("Missing required trip information");
      }
      
      // Validate dates
      const startDate = new Date(tripData.trip.startDate);
      const endDate = new Date(tripData.trip.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid trip dates");
      }
      
      // Create trip
      const newTrip = await tripService.createTrip({
        name: tripData.trip.destination,
        startDate: tripData.trip.startDate,
        endDate: tripData.trip.endDate,
      });
      
      // Define valid categories for frontend validation
      const validCategories = [
        "Adventure", "Food", "Sightseeing", "Entertainment", 
        "Shopping", "Cultural", "Relaxation", "Nature", "Transportation", "Other"
      ];
      
      // Create activities if they exist
      if (tripData.trip.activities && Array.isArray(tripData.trip.activities) && tripData.trip.activities.length > 0) {
        for (const activity of tripData.trip.activities) {
          // Validate activity date
          const activityDate = new Date(activity.date);
          if (isNaN(activityDate.getTime())) {
            console.warn("Skipping activity with invalid date:", activity);
            continue;
          }
          
          // Validate and normalize category
          let category = activity.category || 'Other';
          
          // Make sure category is properly title-cased for consistent display
          const formattedCategory = 
            typeof category === 'string' && category.trim() 
              ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() 
              : 'Other';
          
          // Ensure category is in our valid list, otherwise default to 'Other'
          const finalCategory = validCategories.includes(formattedCategory) 
            ? formattedCategory 
            : 'Other';
          
          await activityService.createActivity(newTrip.id, {
            title: activity.title || "Untitled Activity",
            date: activity.date,
            category: finalCategory,
            notes: activity.notes || activity.description || "",
            estimatedCost: typeof activity.estimatedCost === 'number' ? activity.estimatedCost : null,
          });
        }
      }
      
      toast({
        title: 'Success!',
        description: "Your trip plan has been created successfully.",
      });
      
      // Call onSuccess if provided
      if (onSuccess) onSuccess();
      
      // Close the modal
      onClose();
      
      // Redirect to the trip's activity page
      router.push(`/trips/${newTrip.id}`);
      
    } catch (error) {
      console.error('Error creating trip from validated data:', error);
      throw error;
    }
  };

  const handleClose = () => {
    setMessages([]);
    setShowConfirm(false);
    onClose();
  };

  const emptyState = (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center shadow-xl">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">AI Trip Planner</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-3">
        I'll create a customized travel plan with activities tailored to your preferences.
      </p>
      <div className="flex justify-center space-x-4 mt-5">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs text-muted-foreground">Destinations</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-xs text-muted-foreground">Itineraries</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
            <Plane className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs text-muted-foreground">Activities</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] h-[85vh] flex flex-col p-0 overflow-hidden gap-0 border-primary/5">
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-teal-50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="flex items-center text-xl">
                AI Trip Planner
              </DialogTitle>
              <DialogDescription className="text-xs mt-1 opacity-70">
                Describe your dream trip and I'll create a personalized itinerary for you
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Example: Plan a trip to Goa for 5 days with beach activities..."
            emptyState={emptyState}
            showConfirmButton={showConfirm && !isLoading}
            onConfirmPlan={handleConfirmPlan}
            className="h-full border-0 rounded-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
