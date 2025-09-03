import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload,
  Undo,
  Redo,
  Download,
  Crop,
  Sliders,
  Palette,
  Type,
  Wand2,
  Scissors,
  Eraser,
  Eye
} from "lucide-react";

export function PhotoEditorInterface() {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  const basicTools = [
    { id: 'crop', icon: <Crop className="w-4 h-4" />, label: 'Crop' },
    { id: 'adjust', icon: <Sliders className="w-4 h-4" />, label: 'Adjust' },
    { id: 'filter', icon: <Palette className="w-4 h-4" />, label: 'Filter' },
    { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' }
  ];

  const aiTools = [
    { id: 'ai_enhance', icon: <Wand2 className="w-4 h-4" />, label: 'AI Enhance', color: 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground' },
    { id: 'remove_bg', icon: <Scissors className="w-4 h-4" />, label: 'Remove BG', color: 'bg-background hover:bg-accent hover:text-accent-foreground' },
    { id: 'remove_object', icon: <Eraser className="w-4 h-4" />, label: 'Remove Object', color: 'bg-background hover:bg-accent hover:text-accent-foreground' }
  ];

  const layers = [
    { id: 'background', name: 'Background', visible: true, active: false },
    { id: 'portrait', name: 'Portrait', visible: true, active: true }
  ];

  const history = [
    'AI Enhancement',
    'Brightness +20',
    'Crop 16:9',
    'Original Import'
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  return (
    <Card className="w-full shadow-2xl border overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-primary hover:bg-primary/90"
              data-testid="button-upload-photo"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">100%</span>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              data-testid="button-download-editor"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Interface */}
      <div className="flex h-96 lg:h-[600px]">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-muted border-r border-border p-4 space-y-6 overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Basic Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {basicTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  className="p-3 h-auto flex-col space-y-1"
                  onClick={() => handleToolSelect(tool.id)}
                  data-testid={`button-${tool.id}`}
                >
                  {tool.icon}
                  <span className="text-xs">{tool.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">AI Tools</h3>
            <div className="space-y-2">
              {aiTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant="outline"
                  className={`w-full justify-start ${tool.color}`}
                  onClick={() => handleToolSelect(tool.id)}
                  data-testid={`button-${tool.id}`}
                >
                  {tool.icon}
                  <span className="ml-2">{tool.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Adjustments</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Brightness
                </label>
                <input 
                  type="range" 
                  className="w-full" 
                  min="-100" 
                  max="100" 
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  data-testid="range-brightness"
                />
                <span className="text-xs text-muted-foreground">{brightness}</span>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Contrast
                </label>
                <input 
                  type="range" 
                  className="w-full" 
                  min="-100" 
                  max="100" 
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  data-testid="range-contrast"
                />
                <span className="text-xs text-muted-foreground">{contrast}</span>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Saturation
                </label>
                <input 
                  type="range" 
                  className="w-full" 
                  min="-100" 
                  max="100" 
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  data-testid="range-saturation"
                />
                <span className="text-xs text-muted-foreground">{saturation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center p-8">
          <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden max-w-lg">
            <img 
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Portrait photo being edited in the interface" 
              className="w-full h-auto"
              style={{
                filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`
              }}
              data-testid="img-canvas"
            />
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">
                {selectedTool ? `${selectedTool.replace('_', ' ')} tool active` : 'Drop your photo here or click upload'}
              </p>
              {selectedTool && (
                <Badge variant="default" className="mt-2">
                  {selectedTool.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers & History */}
        <div className="w-64 bg-muted border-l border-border p-4 space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Layers</h3>
            <div className="space-y-2">
              {layers.map((layer) => (
                <div 
                  key={layer.id}
                  className={`p-2 rounded border ${layer.active ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                  data-testid={`layer-${layer.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${layer.active ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {layer.name}
                    </span>
                    <Eye className={`h-4 w-4 ${layer.visible ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">History</h3>
            <div className="space-y-1 text-sm" data-testid="panel-history">
              {history.map((item, index) => (
                <div 
                  key={index}
                  className={index === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
