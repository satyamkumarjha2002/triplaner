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
import { userService } from '@/services/user';
import { User } from '@/types';
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
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripId,
      emails: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchSearchedUsers = async () => {
      if (searchQuery.trim() === '') return; // Don't fetch on empty search
      
      setIsSearching(true);
      try {
        const result = await userService.searchUsers(searchQuery);
        setUsers(result);
      } catch (error) {
        console.error('Error fetching users by search:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearchedUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!isOpen) return;
      
      setIsSearching(true);
      try {
        // Use a separate API endpoint to get all users (limited to a reasonable number)
        const result = await userService.getAllUsers();
        setUsers(result);
      } catch (error) {
        console.error('Error fetching all users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    if (isOpen) {
      fetchAllUsers();
    }
  }, [isOpen]);

  const filteredUsers = searchQuery.trim() === '' 
    ? users.filter(user => !selectedEmails.includes(user.email))
    : users.filter(user => {
        // When searching, filter users that match the search query
        const matchesSearch = 
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Also exclude already selected users
        return matchesSearch && !selectedEmails.includes(user.email);
      });

  const onAddEmail = () => {
    if (!customEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return;
    }
    
    if (!selectedEmails.includes(customEmail)) {
      const newSelectedEmails = [...selectedEmails, customEmail];
      setSelectedEmails(newSelectedEmails);
      form.setValue('emails', newSelectedEmails);
    }
    
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

  const selectAllVisible = () => {
    const visibleEmails = filteredUsers.map(user => user.email);
    const newSelectedEmails = [...new Set([...selectedEmails, ...visibleEmails])];
    setSelectedEmails(newSelectedEmails);
    form.setValue('emails', newSelectedEmails);
  };

  const renderUserList = () => {
    if (isSearching) {
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Searching for users...
        </div>
      );
    }
    
    if (filteredUsers.length > 0) {
      return (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.email}
              className={cn(
                "flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors",
                selectedEmails.includes(user.email) 
                  ? "bg-primary/10 hover:bg-primary/15" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleContactSelection(user.email)}
            >
              <div className="flex items-center">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  selectedEmails.includes(user.email) 
                    ? "border-primary/50 bg-primary/10 text-primary" 
                    : "border-muted-foreground/20 bg-muted"
                )}>
                  {user.name 
                    ? `${user.name.split(' ')[0][0]}${user.name.split(' ')[1]?.[0] || ''}`
                    : user.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {user.name || user.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <div>
                {selectedEmails.includes(user.email) ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } 
    
    if (searchQuery.length > 0) {
      return (
        <div className="py-6 text-center">
          <div className="text-sm font-medium mb-2">No users found</div>
          <div className="text-xs text-muted-foreground mb-4">
            Try a different search term or use email invite
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              setActiveTab('email');
              setCustomEmail(searchQuery.includes('@') ? searchQuery : '');
            }}
          >
            <Mail className="mr-1 h-3 w-3" />
            Invite via Email
          </Button>
        </div>
      );
    }
    
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No users available to invite
      </div>
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    if (values.emails.length === 0) {
      setError('Please select at least one email to invite');
      setIsLoading(false);
      return;
    }

    console.log('Form submission values:', values);
    console.log('Selected emails:', selectedEmails);

    try {
      const invitationPromises = values.emails.map(email => {
        console.log(`Processing invitation for email: ${email}`);
        return tripService.inviteUser({ tripId, email });
      });
      
      const results = await Promise.all(invitationPromises);
      console.log('All invitations sent successfully:', results);
      
      form.reset();
      setSelectedEmails([]);
      
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Failed to invite friends:', err);
      let errorMessage = 'Failed to send invitations. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

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
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
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
          <div className="px-6 pt-4 pb-2 bg-background sticky top-0 z-[5]">
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

          {showSelectedUsers && selectedEmails.length > 0 && (
            <div className="px-3 py-2 border-b">
              <ScrollArea className="max-h-[120px]">
                <div className="flex flex-wrap gap-1 p-3">
                  {selectedEmails.map(email => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                      <span className="max-w-[150px] truncate text-xs">{email}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveEmail(email);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <FormField
                control={form.control}
                name="emails"
                render={() => (
                  <FormItem className="flex-1 flex flex-col overflow-hidden">
                    <FormControl>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <TabsContent value="friends" className="mt-0 flex-1 overflow-hidden flex flex-col">
                          <div className="px-6 py-3 border-b bg-background sticky top-0 z-[5]">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder={isSearching && searchQuery.trim() === '' ? "Loading users..." : "Search users..."}
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                ref={inputRef}
                                disabled={isSearching && searchQuery.trim() === ''}
                              />
                            </div>
                            {users.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Showing {filteredUsers.length} of {users.length} users
                              </p>
                            )}
                          </div>
                          
                          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "300px" }}>
                            <div className="p-4">
                              {renderUserList()}
                            </div>
                          </div>
                          
                          <div className="p-4 border-t bg-muted/50 mt-auto">
                            {filteredUsers.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllVisible}
                                className="w-full mb-2"
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Select All ({filteredUsers.length})
                              </Button>
                            )}
                            <Button 
                              onClick={() => form.handleSubmit(onSubmit)()}
                              disabled={selectedEmails.length === 0 || isLoading}
                              className="w-full"
                            >
                              {isLoading ? "Sending..." : `Invite ${selectedEmails.length > 0 ? `(${selectedEmails.length})` : ''}`}
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="email" className="flex-1 overflow-hidden flex flex-col mt-0">
                          <div className="px-6 py-3 border-b bg-background sticky top-0 z-[5]">
                            <h3 className="text-sm font-medium mb-2">Invite by Email</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                              Use this option when inviting people who don't have an account yet or aren't in the search results.
                            </p>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <Input
                                  ref={emailInputRef}
                                  placeholder="Enter email address..."
                                  value={customEmail}
                                  onChange={(e) => setCustomEmail(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customEmail) {
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
                                Add
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "300px" }}>
                            <div className="p-4">
                              {selectedEmails.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedEmails.map((email) => (
                                    <div 
                                      key={email} 
                                      className="flex items-center justify-between rounded-md border p-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{email}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveEmail(email)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  Enter an email address to invite someone
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-4 border-t bg-muted/50 mt-auto">
                            <Button 
                              onClick={() => form.handleSubmit(onSubmit)()}
                              disabled={selectedEmails.length === 0 || isLoading}
                              className="w-full"
                            >
                              {isLoading ? "Sending..." : `Send ${selectedEmails.length > 0 ? `(${selectedEmails.length})` : ''} Invitations`}
                            </Button>
                          </div>
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