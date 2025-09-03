import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/pricing-card";
import { PhotoEditorInterface } from "@/components/photo-editor-interface";
import { 
  Camera, 
  Wand2, 
  Scissors, 
  Palette, 
  Crop, 
  Layers, 
  Cloud,
  Check,
  ArrowRight,
  Star
} from "lucide-react";

export default function Landing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    {
      icon: <Wand2 className="h-6 w-6" />,
      title: "AI Enhancement",
      description: "Automatically enhance your photos with one-click AI improvements for lighting, color, and detail."
    },
    {
      icon: <Scissors className="h-6 w-6" />,
      title: "Background Removal",
      description: "Remove and replace backgrounds instantly with AI-powered precision and natural-looking results."
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Creative Effects",
      description: "Apply artistic filters, vintage effects, and professional-grade adjustments to create stunning visuals."
    },
    {
      icon: <Crop className="h-6 w-6" />,
      title: "Smart Cropping",
      description: "Crop and resize images with intelligent composition suggestions for perfect framing every time."
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Batch Processing",
      description: "Edit multiple photos simultaneously with consistent settings and professional batch processing."
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Storage",
      description: "Save and access your projects from anywhere with secure cloud storage and instant sync."
    }
  ];

  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Professional headshot editing example",
      label: "AI Portrait Enhancement"
    },
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Mountain landscape photo enhancement",
      label: "Landscape Enhancement"
    },
    {
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Product photography with background removal",
      label: "Background Removal"
    },
    {
      src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Fashion portrait with creative effects",
      label: "Creative Effects"
    },
    {
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Urban street photography with color grading",
      label: "Color Grading"
    },
    {
      src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Wedding photography with romantic enhancement",
      label: "Wedding Enhancement"
    }
  ];

  const testimonials = [
    {
      name: "Jennifer",
      role: "Content Creator",
      content: "I'm not a tech-savvy person, but PhotoPro made me feel like a pro! The interface is sleek and easy to navigate, and the wide range of editing options is impressive."
    },
    {
      name: "Mark",
      role: "Entrepreneur",
      content: "As an entrepreneur, time is everything. PhotoPro makes editing a breeze even without prior knowledge. The speed and efficiency are remarkable."
    },
    {
      name: "Ana",
      role: "Blogger",
      content: "PhotoPro allows me to easily create, modify and manage photos all in one place. The abundance of customizable templates is a massive bonus."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Professional Photo Editing
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your photos with powerful AI-driven editing tools. From basic adjustments to advanced retouching, create stunning visuals in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-all transform hover:scale-105"
                  data-testid="button-edit-free"
                  onClick={() => window.location.href = '/api/login'}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Edit Photo for Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-view-pricing"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Check className="h-4 w-4 text-accent mr-2" />
                  No watermarks
                </span>
                <span className="flex items-center">
                  <Check className="h-4 w-4 text-accent mr-2" />
                  AI-powered tools
                </span>
                <span className="flex items-center">
                  <Check className="h-4 w-4 text-accent mr-2" />
                  HD downloads
                </span>
              </div>
            </div>
            <div className="relative">
              <Card className="shadow-2xl border overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" 
                  alt="Professional photo editing interface" 
                  className="w-full h-auto"
                  data-testid="img-hero-interface"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Powerful Editing Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for professional photo editing, powered by advanced AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background border hover:shadow-lg transition-shadow" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mb-4 text-primary-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Editor Interface Section */}
      <section id="editor" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Professional Editing Interface</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our intuitive photo editor with professional-grade tools
            </p>
          </div>
          
          <PhotoEditorInterface />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core editing features.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <span className={billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}>
                Monthly
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-6 w-11 rounded-full bg-muted p-0"
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                data-testid="button-billing-toggle"
              >
                <div className={`h-4 w-4 rounded-full bg-primary transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </Button>
              <span className={billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}>
                Yearly
              </span>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Save 20%
              </Badge>
            </div>
          </div>
          
          <PricingCard billingPeriod={billingPeriod} />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Stunning Results</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what's possible with our professional photo editing tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl" data-testid={`img-gallery-${index}`}>
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">{image.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional photo editing in just three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Your Photo",
                description: "Drag and drop or select your photo to start editing. Supports all major image formats."
              },
              {
                step: "2", 
                title: "Edit & Enhance",
                description: "Use our powerful tools and AI features to transform your photo into a masterpiece."
              },
              {
                step: "3",
                title: "Download & Share", 
                description: "Download in high quality and share directly to social media or save to cloud storage."
              }
            ].map((item, index) => (
              <div key={index} className="text-center" data-testid={`step-${index}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">People Love PhotoPro</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Photos?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join millions of creators who trust PhotoPro for their professional photo editing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              data-testid="button-start-trial"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="button-view-plans"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View All Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
