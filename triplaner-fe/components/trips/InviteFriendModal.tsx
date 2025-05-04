'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Check, ChevronsUpDown, PlusCircle, X, UserPlus, Mail, Search, Users, AtSign, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tripService } from '@/services/trips';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  tripId: z.string(),
  emails: z.array(z.string().email({
    message: 'Please enter valid email addresses',
  })).min(1, {
    message: 'Please add at least one email',
  }),
  customEmail: z.string().email({
    message: 'Please enter a valid email address',
  }).optional(),
});

// Sample of recent contacts to select from
const recentContacts = [
  { email: 'friend1@example.com', name: 'Sarah Johnson', avatar: 'SJ' },
  { email: 'friend2@example.com', name: 'Michael Brown', avatar: 'MB' },
  { email: 'friend3@example.com', name: 'Emma Wilson', avatar: 'EW' },
  { email: 'friend4@example.com', name: 'James Davis', avatar: 'JD' },
  { email: 'friend5@example.com', name: 'Laura Miller', avatar: 'LM' },
  { email: 'friend6@example.com', name: 'David Thompson', avatar: 'DT' },
  { email: 'friend7@example.com', name: 'Sophia Martinez', avatar: 'SM' },
  { email: 'friend8@example.com', name: 'Robert Anderson', avatar: 'RA' },
];

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tripId: string;
  tripName: string;
}

export function InviteFriendModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  tripId,
  tripName 
}: InviteFriendModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [showSelectedUsers, setShowSelectedUsers] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripId,
      emails: [],
      customEmail: '',
    },
  });

  // Filter contacts based on search query
  const filteredContacts = recentContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onAddEmail = () => {
    // Validate email
    if (!customEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return;
    }
    
    // Add to selected emails if not already selected
    if (!selectedEmails.includes(customEmail)) {
      const newSelectedEmails = [...selectedEmails, customEmail];
      setSelectedEmails(newSelectedEmails);
      form.setValue('emails', newSelectedEmails);
    }
    
    // Clear input
    setCustomEmail('');
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  const onRemoveEmail = (email: string) => {
    const newSelectedEmails = selectedEmails.filter(e => e !== email);
    setSelectedEmails(newSelectedEmails);
    form.setValue('emails', newSelectedEmails);
  };

  const toggleContactSelection = (email: string) => {
    if (selectedEmails.includes(email)) {
      onRemoveEmail(email);
    } else {
      const newSelectedEmails = [...selectedEmails, email];
      setSelectedEmails(newSelectedEmails);
      form.setValue('emails', newSelectedEmails);
    }
  };

  // Select all visible contacts
  const selectAllVisible = () => {
    const visibleEmails = filteredContacts.map(contact => contact.email);
    const newSelectedEmails = [...new Set([...selectedEmails, ...visibleEmails])];
    setSelectedEmails(newSelectedEmails);
    form.setValue('emails', newSelectedEmails);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      // Send invitations for each email
      const invitationPromises = values.emails.map(email => 
        tripService.inviteUser({ tripId, email })
      );
      
      await Promise.all(invitationPromises);
      
      // Reset form
      form.reset();
      setSelectedEmails([]);
      
      // Close modal
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to invite friends:', err);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // When the dialog opens, clear any previous selections
  useEffect(() => {
    if (isOpen) {
      setSelectedEmails([]);
      form.setValue('emails', []);
      setCustomEmail('');
      setSearchQuery('');
      setActiveTab('friends');
      setShowSelectedUsers(false);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 bg-background sticky top-0 z-10 border-b">
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-muted-foreground" />
            Invite Friends to {tripName}
          </DialogTitle>
          <DialogDescription>
            Select friends or enter email addresses to invite
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Selected Users Summary */}
          {selectedEmails.length > 0 && (
            <div className="px-6 py-2 border-b">
              <button 
                className="flex items-center w-full justify-between text-sm text-muted-foreground"
                onClick={() => setShowSelectedUsers(!showSelectedUsers)}
                type="button"
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">Selected ({selectedEmails.length})</span>
                </div>
                {showSelectedUsers ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full flex-1 overflow-hidden">
              <FormField
                control={form.control}
                name="emails"
                render={() => (
                  <FormItem className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-3">
                      <FormMessage />
                    </div>
                    <FormControl>
                      <div className="flex flex-col h-full flex-1 overflow-hidden">
                        {/* Selected users section - Collapsible */}
                        {selectedEmails.length > 0 && showSelectedUsers && (
                          <div className="px-6 py-2">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {selectedEmails.map(email => {
                                const contact = recentContacts.find(c => c.email === email);
                                return (
                                  <Badge 
                                    key={email} 
                                    variant="secondary" 
                                    className="px-2 py-1.5 gap-1.5 h-8"
                                  >
                                    {contact ? (
                                      <>
                                        <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-1">
                                          {contact.avatar}
                                        </span>
                                        <span className="truncate max-w-[150px]">{contact.name}</span>
                                      </>
                                    ) : (
                                      <span className="truncate max-w-[200px]">{email}</span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                                      onClick={() => onRemoveEmail(email)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <TabsContent value="friends" className="mt-0 flex-1 overflow-hidden">
                          <div className="px-6 pb-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                ref={inputRef}
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                              />
                            </div>
                            <div className="flex justify-end mt-2">
                              {filteredContacts.length > 0 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={selectAllVisible}
                                  className="text-xs h-7"
                                >
                                  Select All ({filteredContacts.length})
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* User selection list */}
                          <ScrollArea className="px-3 h-[280px]">
                            <div className="space-y-1 p-1">
                              {filteredContacts.length > 0 ? (
                                filteredContacts.map((contact) => (
                                  <div
                                    key={contact.email}
                                    className={cn(
                                      "flex items-center space-x-2 rounded-md px-2 py-2 cursor-pointer",
                                      selectedEmails.includes(contact.email) 
                                        ? "bg-accent/50" 
                                        : "hover:bg-accent/30"
                                    )}
                                    onClick={() => toggleContactSelection(contact.email)}
                                  >
                                    <div className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                                      selectedEmails.includes(contact.email)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border bg-background"
                                    )}>
                                      {contact.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-none">{contact.name}</p>
                                      <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                                    </div>
                                    <div className="flex h-5 w-5 items-center justify-center">
                                      {selectedEmails.includes(contact.email) && (
                                        <Check className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-6 text-center">
                                  <p className="text-sm text-muted-foreground">No matching contacts</p>
                                  {searchQuery.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
                                    <Button
                                      variant="outline"
                                      className="mt-2"
                                      size="sm"
                                      onClick={() => {
                                        if (!selectedEmails.includes(searchQuery)) {
                                          const newSelectedEmails = [...selectedEmails, searchQuery];
                                          setSelectedEmails(newSelectedEmails);
                                          form.setValue('emails', newSelectedEmails);
                                          setSearchQuery('');
                                        }
                                      }}
                                    >
                                      <Mail className="mr-2 h-4 w-4" />
                                      Add "{searchQuery}"
                                    </Button>
                                  )}
                                </div>
                              )}

                              {/* Custom email section when typing an email */}
                              {searchQuery.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && 
                              !filteredContacts.find(c => c.email === searchQuery) &&
                              !selectedEmails.includes(searchQuery) && (
                                <div className="pt-2">
                                  <div
                                    className="flex items-center space-x-2 rounded-md border border-dashed px-2 py-2 cursor-pointer hover:bg-accent/30"
                                    onClick={() => {
                                      const newSelectedEmails = [...selectedEmails, searchQuery];
                                      setSelectedEmails(newSelectedEmails);
                                      form.setValue('emails', newSelectedEmails);
                                      setSearchQuery('');
                                    }}
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium leading-none">Add New Contact</p>
                                      <p className="text-sm text-muted-foreground">{searchQuery}</p>
                                    </div>
                                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="email" className="mt-0 flex-1 overflow-hidden">
                          <div className="px-6 py-4">
                            <p className="text-sm text-muted-foreground mb-3">
                              Enter email addresses to invite people who aren't in your contacts.
                            </p>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    ref={emailInputRef}
                                    placeholder="example@email.com"
                                    value={customEmail}
                                    onChange={(e) => setCustomEmail(e.target.value)}
                                    className="pl-9"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && customEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                                        e.preventDefault();
                                        onAddEmail();
                                      }
                                    }}
                                  />
                                </div>
                                <Button 
                                  type="button" 
                                  size="sm"
                                  onClick={onAddEmail}
                                  disabled={!customEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Tip: You can add multiple emails at once. Press Enter after each email.
                              </p>
                            </div>
                          </div>
                          <ScrollArea className="px-6 h-[220px]">
                            {selectedEmails.length === 0 && (
                              <div className="py-8 text-center border-2 border-dashed rounded-md">
                                <Mail className="h-10 w-10 text-muted-foreground mx-auto opacity-30" />
                                <p className="text-sm text-muted-foreground mt-2">
                                  No emails added yet
                                </p>
                              </div>
                            )}
                          </ScrollArea>
                        </TabsContent>

                        {error && (
                          <div className="px-6 py-2">
                            <p className="text-sm text-destructive">{error}</p>
                          </div>
                        )}

                        <div className="border-t p-4 bg-background mt-auto">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={onClose}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isLoading || selectedEmails.length === 0}
                            >
                              {isLoading ? 'Sending invites...' : 'Send Invites'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 