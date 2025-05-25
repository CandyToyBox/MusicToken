import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Tag, MessageSquareText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIMetadataGeneratorProps {
  title?: string;
  description?: string;
  onMetadataGenerated: (metadata: {
    tokenName: string;
    tokenSymbol: string;
    description: string;
    tags: string[];
  }) => void;
}

export default function AIMetadataGenerator({ 
  title = '', 
  description = '', 
  onMetadataGenerated 
}: AIMetadataGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<{
    tokenName: string;
    tokenSymbol: string;
    description: string;
    tags: string[];
  } | null>(null);
  
  const { toast } = useToast();
  
  const generateMetadata = async () => {
    if (!title && !description) {
      toast({
        title: "Missing Information",
        description: "Please provide a song title or description first.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiRequest<{
        success: boolean;
        metadata: {
          tokenName?: string;
          tokenSymbol?: string;
          description?: string;
          tags?: string[];
        };
        error?: string;
      }>('/api/ai/generate-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });
      
      if (response.success && response.metadata) {
        const generatedMetadata = {
          tokenName: response.metadata.tokenName || `${title} Token`,
          tokenSymbol: response.metadata.tokenSymbol || title.substring(0, 3).toUpperCase(),
          description: response.metadata.description || description,
          tags: response.metadata.tags || ["music", "blockchain"]
        };
        
        setMetadata(generatedMetadata);
        onMetadataGenerated(generatedMetadata);
        
        toast({
          title: "Metadata Generated",
          description: "AI has suggested metadata for your song",
        });
      } else {
        throw new Error(response.error || "Failed to generate metadata");
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
      toast({
        title: "Error",
        description: "Failed to generate metadata. Please try again or enter details manually.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyMetadata = () => {
    if (metadata) {
      onMetadataGenerated(metadata);
      
      toast({
        title: "Metadata Applied",
        description: "AI-generated metadata has been applied to your song",
      });
    }
  };
  
  return (
    <Card className="w-full border-dashed border-primary/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Metadata Generator
        </CardTitle>
        <CardDescription>
          Let AI suggest metadata for your song token
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!metadata ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Generate token name, symbol, and description using AI based on your song's title and description.
            </p>
            
            <Button 
              onClick={generateMetadata} 
              disabled={loading || (!title && !description)}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Metadata
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Token Name:</span>
              </div>
              <p className="text-sm ml-6">{metadata.tokenName}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Token Symbol:</span>
              </div>
              <p className="text-sm ml-6">{metadata.tokenSymbol}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Description:</span>
              </div>
              <p className="text-sm ml-6">{metadata.description}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={applyMetadata} 
              variant="default"
              size="sm"
              className="w-full mt-4"
            >
              Apply Metadata
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}