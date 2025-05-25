import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, BrainCircuit, LineChart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIInsightsProps {
  songId: number;
  songTitle: string;
}

export default function AIInsights({ songId, songTitle }: AIInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{
    insights: string;
    recommendations?: string;
  } | null>(null);
  
  const { toast } = useToast();
  
  const fetchInsights = async () => {
    setLoading(true);
    
    try {
      const response = await apiRequest<{
        success: boolean;
        analysis: {
          insights: string;
          recommendations?: string;
        };
        error?: string;
      }>(`/api/ai/analyze-song/${songId}`);
      
      if (response.success && response.analysis) {
        setInsights(response.analysis);
        toast({
          title: "Analysis Complete",
          description: "AI insights for your song are ready to view",
        });
      } else {
        throw new Error(response.error || "Failed to get AI insights");
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Get AI-powered analytics for "{songTitle}"
            </CardDescription>
          </div>
          <Button 
            onClick={fetchInsights} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {!insights && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <LineChart className="h-12 w-12 mb-3 opacity-50" />
            <p>Click "Generate Insights" to analyze on-chain performance data for this song</p>
            <p className="text-xs mt-2">Powered by ThirdWeb Nebula AI</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <p className="text-center text-muted-foreground">
              Analyzing blockchain data and generating insights...
            </p>
          </div>
        )}
        
        {insights && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Performance Insights</h3>
              <p className="text-muted-foreground">{insights.insights}</p>
            </div>
            
            {insights.recommendations && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
                  <p className="text-muted-foreground">{insights.recommendations}</p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/30 flex justify-between text-xs text-muted-foreground">
        <span>Data analyzed by ThirdWeb Nebula AI</span>
        <span>Updated just now</span>
      </CardFooter>
    </Card>
  );
}