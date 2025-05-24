import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSongSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePrivy } from "@/providers/PrivyProvider";
import { IpfsClient } from "@/lib/ipfs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Extend the song schema with validation
const formSchema = insertSongSchema.extend({
  songFile: z.instanceof(File).optional(),
  artworkFile: z.instanceof(File).optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  genre: z.string().min(1, "Please select a genre"),
  tokenName: z.string().min(2, "Token name must be at least 2 characters"),
  tokenSymbol: z.string().min(2, "Token symbol must be at least 2 characters").max(5, "Token symbol cannot exceed 5 characters"),
});

export default function SongUploadForm() {
  const [songFileName, setSongFileName] = useState<string>("");
  const [artworkFileName, setArtworkFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const songInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const { user } = usePrivy();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user.walletAddress ? parseInt(user.walletAddress.substring(2, 10), 16) % 1000 : 1,
      title: "",
      description: "",
      genre: "Electronic",
      tokenName: "",
      tokenSymbol: "",
      enableFarcaster: true,
      songUrl: "",
      artworkUrl: "",
    },
  });

  // Handle song file selection
  const handleSongFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSongFileName(file.name);
      form.setValue("songFile", file);
      
      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        form.setValue("duration", Math.floor(audio.duration));
      };
    }
  };

  // Handle artwork file selection
  const handleArtworkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFileName(file.name);
      form.setValue("artworkFile", file);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user.walletAddress) {
      toast({
        title: "Please connect your wallet",
        description: "You need to connect your wallet to upload songs",
        variant: "destructive",
      });
      return;
    }
    
    const songFile = values.songFile;
    const artworkFile = values.artworkFile;
    
    if (!songFile || !artworkFile) {
      toast({
        title: "Missing files",
        description: "Please upload both a song file and artwork",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload files to IPFS
      const [songUrl, artworkUrl] = await Promise.all([
        IpfsClient.uploadFile(songFile),
        IpfsClient.uploadFile(artworkFile),
      ]);
      
      // Create song
      const songData = {
        ...values,
        userId: form.getValues().userId,
        songUrl,
        artworkUrl,
      };
      
      // Remove file objects as they can't be serialized
      delete (songData as any).songFile;
      delete (songData as any).artworkFile;
      
      const response = await apiRequest("POST", "/api/songs", songData);
      const createdSong = await response.json();
      
      // Deploy token contract
      await apiRequest("POST", `/api/songs/${createdSong.id}/deploy`);
      
      // Invalidate songs cache
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      
      // Show success notification
      (window as any).showNotification("Song token created successfully!");
      
      // Redirect to songs page after a delay
      setTimeout(() => {
        navigate("/my-songs");
      }, 2000);
    } catch (error) {
      console.error("Error creating song:", error);
      toast({
        title: "Upload failed",
        description: "Failed to create song token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Song File Upload */}
        <div>
          <FormLabel htmlFor="song-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Song File (MP3, WAV)
          </FormLabel>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary dark:border-gray-600 dark:hover:border-primary">
            <div className="space-y-1 text-center">
              <i className="fas fa-music mx-auto text-gray-400 text-3xl dark:text-gray-500"></i>
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="song-file" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none dark:text-blue-400 dark:hover:text-blue-300">
                  <span>Upload a file</span>
                  <input 
                    id="song-file"
                    name="song-file"
                    type="file" 
                    className="sr-only" 
                    accept="audio/mp3,audio/wav"
                    onChange={handleSongFileChange}
                    ref={songInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {songFileName || "MP3 or WAV up to 15MB"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Artwork Upload */}
        <div>
          <FormLabel htmlFor="artwork-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Artwork (JPG, PNG)
          </FormLabel>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary dark:border-gray-600 dark:hover:border-primary">
            <div className="space-y-1 text-center">
              <i className="fas fa-image mx-auto text-gray-400 text-3xl dark:text-gray-500"></i>
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="artwork-file" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none dark:text-blue-400 dark:hover:text-blue-300">
                  <span>Upload artwork</span>
                  <input 
                    id="artwork-file"
                    name="artwork-file"
                    type="file" 
                    className="sr-only" 
                    accept="image/jpeg,image/png"
                    onChange={handleArtworkFileChange}
                    ref={artworkInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {artworkFileName || "JPG or PNG, 1:1 ratio recommended"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Song Metadata */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="sm:col-span-4">
                <FormLabel>Song Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter song title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Genre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Electronic">Electronic</SelectItem>
                    <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                    <SelectItem value="Rock">Rock</SelectItem>
                    <SelectItem value="Pop">Pop</SelectItem>
                    <SelectItem value="Classical">Classical</SelectItem>
                    <SelectItem value="Jazz">Jazz</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-6">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell listeners about your song"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Brief description of your song. This will be stored on-chain.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Token Details */}
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">Token Details</h4>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="tokenName"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. My Song Token" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name for your ERC-20 token
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tokenSymbol"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Token Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MST" maxLength={5} {...field} />
                  </FormControl>
                  <FormDescription>
                    Short symbol for your token (2-5 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Farcaster Integration */}
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <FormField
            control={form.control}
            name="enableFarcaster"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Farcaster Integration</FormLabel>
                  <FormDescription>
                    Create a Farcaster Frame for your song to share with the community
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        {/* Submit Button */}
        <div className="pt-5">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="mr-3"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isUploading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : "Create Song Token"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
