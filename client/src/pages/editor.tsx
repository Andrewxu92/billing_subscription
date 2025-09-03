import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PhotoEditorInterface } from "@/components/photo-editor-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User, UserSubscription, SubscriptionPlan } from "@shared/schema";
import { 
  Camera, 
  ArrowLeft, 
  Wand2, 
  Scissors, 
  Eraser,
  Download,
  Save,
  Zap
} from "lucide-react";

interface UserWithSubscription extends User {
  subscription?: UserSubscription & { plan: SubscriptionPlan };
  aiUsageThisMonth?: number;
}

export default function Editor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Get user subscription info
  const { data: userInfo } = useQuery<UserWithSubscription>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // AI Usage mutation
  const aiUsageMutation = useMutation({
    mutationFn: async (featureType: string) => {
      return await apiRequest('POST', '/api/ai-usage', { featureType });
    },
    onSuccess: () => {
      toast({
        title: "AI Tool Used",
        description: "AI feature applied successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to use AI tool",
        variant: "destructive",
      });
    },
  });

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return await apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: () => {
      toast({
        title: "Project Saved",
        description: "Your project has been saved successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const handleAiTool = async (toolType: string) => {
    // Check subscription limits
    if (userInfo?.subscription?.plan?.name === 'Free' && userInfo?.aiUsageThisMonth >= 5) {
      toast({
        title: "Limit Reached",
        description: "You've reached your monthly AI usage limit. Upgrade to Pro for unlimited access.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTool(toolType);
    await aiUsageMutation.mutateAsync(toolType);
  };

  const handleSaveProject = () => {
    const projectData = {
      name: `Project ${new Date().toLocaleDateString()}`,
      thumbnailUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      projectData: {
        selectedTool,
        timestamp: new Date().toISOString(),
      }
    };
    saveProjectMutation.mutate(projectData);
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const canUseAiTools = userInfo?.subscription?.plan?.name !== 'Free' || 
                      (userInfo?.aiUsageThisMonth || 0) < 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGoHome}
                data-testid="button-back-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">PhotoPro Editor</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant={canUseAiTools ? "default" : "destructive"}>
                  {userInfo?.subscription?.plan?.name || 'Free'} Plan
                </Badge>
                {userInfo?.subscription?.plan?.name === 'Free' && (
                  <span className="text-sm text-muted-foreground">
                    AI Credits: {5 - (userInfo?.aiUsageThisMonth || 0)}/5
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveProject}
                disabled={saveProjectMutation.isPending}
                data-testid="button-save-project"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Project
              </Button>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-primary to-secondary"
                data-testid="button-download"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-muted border-r border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* AI Tools Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-primary" />
                  AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={selectedTool === 'ai_enhance' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleAiTool('ai_enhance')}
                  disabled={!canUseAiTools || aiUsageMutation.isPending}
                  data-testid="button-ai-enhance"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  AI Enhance
                  {!canUseAiTools && <Badge variant="destructive" className="ml-auto">Limit</Badge>}
                </Button>
                
                <Button
                  variant={selectedTool === 'background_removal' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleAiTool('background_removal')}
                  disabled={!canUseAiTools || aiUsageMutation.isPending}
                  data-testid="button-remove-bg"
                >
                  <Scissors className="mr-2 h-4 w-4" />
                  Remove Background
                  {!canUseAiTools && <Badge variant="destructive" className="ml-auto">Limit</Badge>}
                </Button>
                
                <Button
                  variant={selectedTool === 'object_removal' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleAiTool('object_removal')}
                  disabled={!canUseAiTools || aiUsageMutation.isPending}
                  data-testid="button-remove-object"
                >
                  <Eraser className="mr-2 h-4 w-4" />
                  Remove Object
                  {!canUseAiTools && <Badge variant="destructive" className="ml-auto">Limit</Badge>}
                </Button>

                {!canUseAiTools && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive font-medium mb-2">
                      AI Credit Limit Reached
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to Pro for unlimited AI tools
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.location.href = '/#pricing'}
                      data-testid="button-upgrade-editor"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Adjustments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adjustments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Brightness
                  </label>
                  <input 
                    type="range" 
                    className="w-full" 
                    min="-100" 
                    max="100" 
                    defaultValue="0"
                    data-testid="slider-brightness"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Contrast
                  </label>
                  <input 
                    type="range" 
                    className="w-full" 
                    min="-100" 
                    max="100" 
                    defaultValue="0"
                    data-testid="slider-contrast"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Saturation
                  </label>
                  <input 
                    type="range" 
                    className="w-full" 
                    min="-100" 
                    max="100" 
                    defaultValue="0"
                    data-testid="slider-saturation"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Tool Info */}
            {selectedTool && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="default" data-testid="badge-current-tool">
                    {selectedTool.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tool is active. Make adjustments using the canvas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Center - Canvas Area */}
        <div className="flex-1 bg-background flex items-center justify-center p-8">
          <PhotoEditorInterface />
        </div>

        {/* Right Sidebar - Layers & History */}
        <div className="w-80 bg-muted border-l border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Layers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="bg-background p-3 rounded border border-border" data-testid="layer-background">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Background</span>
                    <Badge variant="outline">Visible</Badge>
                  </div>
                </div>
                <div className="bg-primary/10 border border-primary p-3 rounded" data-testid="layer-main">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary font-medium">Main Image</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm" data-testid="history-panel">
                  {selectedTool && (
                    <div className="text-primary font-medium">
                      {selectedTool.replace('_', ' ')} Applied
                    </div>
                  )}
                  <div className="text-muted-foreground">Image Imported</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <select className="w-full p-2 border border-input rounded-md bg-background" data-testid="select-format">
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Quality</label>
                  <select className="w-full p-2 border border-input rounded-md bg-background" data-testid="select-quality">
                    <option value="high">High (4K)</option>
                    <option value="medium">Medium (1080p)</option>
                    <option value="low">Low (720p)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
