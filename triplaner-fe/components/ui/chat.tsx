import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Avatar, AvatarFallback } from "./avatar";
import { Textarea } from "./textarea";
import { Check, ChevronRight, Send, Sparkles, Timer } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  emptyState?: React.ReactNode;
  onConfirmPlan?: () => void;
  showConfirmButton?: boolean;
}

// Suggested prompts for users to try
const SUGGESTED_PROMPTS = [
  "Plan a 5-day trip to Bali with beach activities",
  "I'd like a weekend trip to New York focused on museums and food",
  "Create a family-friendly 7-day trip to Tokyo",
  "Plan a romantic 4-day getaway in Paris",
];

export function Chat({
  messages,
  onSendMessage,
  isLoading = false,
  className,
  placeholder = "Type your message...",
  emptyState,
  onConfirmPlan,
  showConfirmButton = false,
}: ChatProps) {
  const [input, setInput] = React.useState("");
  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);
  const [isTypingAnimation, setIsTypingAnimation] = React.useState(false);

  // Simulate typing effect when the AI starts responding
  React.useEffect(() => {
    if (isLoading) {
      setIsTypingAnimation(true);
    } else {
      // Keep typing animation for a moment after loading finishes
      const timer = setTimeout(() => {
        setIsTypingAnimation(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  // Format message content with line breaks and links
  const formatMessageContent = (content: string) => {
    // Replace line breaks with <br> tags
    const withLineBreaks = content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return withLineBreaks;
  };

  React.useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTypingAnimation]);

  return (
    <div className={cn("flex h-full flex-col rounded-md border bg-gradient-to-b from-background to-muted/20", className)}>
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && emptyState ? (
          <div className="flex flex-col h-full items-center justify-center">
            {emptyState}
            
            {/* Suggested prompts */}
            <div className="mt-8 w-full max-w-md space-y-2">
              <p className="text-sm text-muted-foreground text-center mb-3">Try one of these examples:</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="justify-between text-left h-auto py-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <span className="text-sm font-normal">{prompt}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3 animate-fadeIn", {
                  "justify-end": message.role === "user",
                })}
              >
                {message.role !== "user" && (
                  <Avatar className="h-9 w-9 border-2 border-primary/10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-teal-500">
                      <Sparkles className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn("rounded-lg px-4 py-3 max-w-[85%] shadow-sm", {
                    "bg-card border text-foreground": message.role !== "user",
                    "bg-primary text-primary-foreground ml-auto": message.role === "user",
                  })}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {formatMessageContent(message.content)}
                  </div>
                  <div
                    className={cn("mt-1.5 text-xs flex items-center gap-1", {
                      "text-muted-foreground": message.role !== "user",
                      "text-primary-foreground/70": message.role === "user",
                    })}
                  >
                    <Timer className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-9 w-9 border-2 border-primary/10">
                    <AvatarFallback className="bg-muted">
                      <span className="text-xs font-medium text-foreground">You</span>
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTypingAnimation && (
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-teal-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-card border max-w-[85%] shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </ScrollArea>
      
      {showConfirmButton && (
        <div className="border-t p-4 flex justify-center bg-gradient-to-r from-blue-50/50 to-teal-50/50 dark:from-blue-950/20 dark:to-teal-950/20">
          <Button 
            onClick={onConfirmPlan} 
            disabled={isLoading} 
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-md transition-all hover:shadow-lg"
          >
            <Check className="mr-2 h-4 w-4" />
            Create Trip from This Plan
          </Button>
        </div>
      )}
        
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 resize-none min-h-[52px] transition-all focus-visible:ring-1 focus-visible:ring-primary"
            rows={input.split('\n').length > 2 ? Math.min(5, input.split('\n').length) : 2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            size="icon"
            className={cn("h-[52px] w-[52px] rounded-full transition-all", {
              "bg-gray-200 dark:bg-gray-800": !input.trim() || isLoading,
              "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 shadow-md": input.trim() && !isLoading,
            })}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">Shift + Enter</kbd> for new line
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />
            <span>Powered by OpenAI</span>
          </div>
        </div>
      </div>
    </div>
  );
} 