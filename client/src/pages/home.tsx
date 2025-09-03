import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionStatus } from "@/components/subscription-status";
import { PhotoEditorInterface } from "@/components/photo-editor-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { UserProject } from "@shared/schema";
import { 
  Camera, 
  Plus, 
  Clock, 
  Zap, 
  FileImage,
  Calendar
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: projects = [], isLoading: projectsLoading } = useQuery<UserProject[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleCreateProject = () => {
    // Navigate to editor
    window.location.href = "/editor";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PhotoPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground" data-testid="text-username">
                {user?.firstName || user?.email || "User"}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-primary to-secondary"
                    onClick={handleCreateProject}
                    data-testid="button-new-project"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-templates">
                    <FileImage className="mr-2 h-4 w-4" />
                    Browse Templates
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Navigation</h3>
                <nav className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" data-testid="nav-dashboard">
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" data-testid="nav-projects">
                    My Projects
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" data-testid="nav-subscription">
                    Subscription
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" data-testid="nav-settings">
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Subscription Status */}
            <SubscriptionStatus />

            {/* Quick Start Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-primary" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div 
                    className="cursor-pointer group"
                    onClick={() => window.location.href = "/editor"}
                    data-testid="quick-start-editor"
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Camera className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h3 className="font-semibold mb-2">Photo Editor</h3>
                        <p className="text-sm text-muted-foreground">
                          Start editing photos with our powerful AI tools
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div 
                    className="cursor-pointer group"
                    onClick={() => document.getElementById('editor-interface')?.scrollIntoView({ behavior: 'smooth' })}
                    data-testid="quick-start-templates"
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <FileImage className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h3 className="font-semibold mb-2">Templates</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose from professional templates and presets
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Recent Projects
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateProject}
                    data-testid="button-create-project"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {projects.slice(0, 6).map((project: Project) => (
                      <div 
                        key={project.id} 
                        className="group cursor-pointer"
                        data-testid={`project-${project.id}`}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                            {project.thumbnailUrl ? (
                              <img 
                                src={project.thumbnailUrl}
                                alt={`${project.name} thumbnail`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                <FileImage className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium text-foreground mb-1" data-testid={`project-name-${project.id}`}>
                              {project.name}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span data-testid={`project-date-${project.id}`}>
                                {formatDate(project.lastModified)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                    <Button 
                      onClick={handleCreateProject}
                      data-testid="button-first-project"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Editor Interface Preview */}
            <Card id="editor-interface">
              <CardHeader>
                <CardTitle>Try Our Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoEditorInterface />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
