import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Heart, 
  Calendar, 
  Lightbulb, 
  Users, 
  Grid3X3, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  widget_type: string;
  position: number;
  is_active: boolean;
  size: 'small' | 'medium' | 'large';
}

const AVAILABLE_WIDGETS = [
  {
    id: 'bucket-list',
    title: 'Meine Bucket List',
    description: 'Verwalte deine Lebensziele und Träume',
    icon: Grid3X3,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  },
  {
    id: 'dating-journal',
    title: 'Dating Journal',
    description: 'Dokumentiere deine Dating-Erfahrungen',
    icon: Heart,
    color: 'bg-gradient-to-br from-pink-500 to-red-500'
  },
  {
    id: 'dating-ideas',
    title: 'Dating Ideen',
    description: 'Sammle kreative Date-Vorschläge',
    icon: Lightbulb,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500'
  },
  {
    id: 'dating-app',
    title: 'Dating App',
    description: 'Finde interessante Personen',
    icon: Users,
    color: 'bg-gradient-to-br from-blue-500 to-purple-500'
  }
];

export default function Apps() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardLayout();
  }, []);

  const fetchDashboardLayout = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_layout')
        .select('*')
        .eq('user_id', user?.id)
        .order('position');

      if (error) {
        console.error('Error fetching dashboard layout:', error);
        // Create default layout if none exists
        createDefaultLayout();
        return;
      }

      if (data && data.length > 0) {
        setLayout(data);
      } else {
        createDefaultLayout();
      }
    } catch (error) {
      console.error('Error:', error);
      createDefaultLayout();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultLayout = async () => {
    const defaultWidgets = AVAILABLE_WIDGETS.map((widget, index) => ({
      widget_type: widget.id,
      position: index,
      is_active: true,
      size: 'medium' as const,
      user_id: user?.id
    }));

    try {
      const { data, error } = await supabase
        .from('dashboard_layout')
        .insert(defaultWidgets)
        .select();

      if (error) {
        console.error('Error creating default layout:', error);
        return;
      }

      setLayout(data || []);
    } catch (error) {
      console.error('Error creating default layout:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newLayout = Array.from(layout);
    const [reorderedItem] = newLayout.splice(result.source.index, 1);
    newLayout.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedLayout = newLayout.map((item, index) => ({
      ...item,
      position: index
    }));

    setLayout(updatedLayout);

    // Save to database
    try {
      const updates = updatedLayout.map(widget => ({
        id: widget.id,
        position: widget.position
      }));

      for (const update of updates) {
        await supabase
          .from('dashboard_layout')
          .update({ position: update.position })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      toast({
        title: "Fehler",
        description: "Layout konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const resetLayout = async () => {
    try {
      // Delete existing layout
      await supabase
        .from('dashboard_layout')
        .delete()
        .eq('user_id', user?.id);

      // Create new default layout
      await createDefaultLayout();
      
      toast({
        title: "Layout zurückgesetzt",
        description: "Das Dashboard wurde auf die Standardkonfiguration zurückgesetzt.",
      });
    } catch (error) {
      console.error('Error resetting layout:', error);
      toast({
        title: "Fehler",
        description: "Layout konnte nicht zurückgesetzt werden.",
        variant: "destructive",
      });
    }
  };

  const getWidgetConfig = (widgetType: string) => {
    return AVAILABLE_WIDGETS.find(w => w.id === widgetType);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Apps Dashboard</h1>
        <Button
          variant="outline"
          onClick={resetLayout}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Layout zurücksetzen</span>
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {layout
                .filter(widget => widget.is_active)
                .map((widget, index) => {
                  const config = getWidgetConfig(widget.widget_type);
                  if (!config) return null;

                  return (
                    <Draggable
                      key={widget.id}
                      draggableId={widget.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-all duration-200 hover:shadow-lg cursor-move ${
                            snapshot.isDragging ? 'shadow-2xl scale-105' : ''
                          } ${
                            widget.size === 'large' ? 'md:col-span-2' : ''
                          }`}
                        >
                          <CardHeader className={`text-white ${config.color} rounded-t-lg`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <config.icon className="w-6 h-6" />
                                <CardTitle className="text-lg">{config.title}</CardTitle>
                              </div>
                              <Badge variant="secondary" className="bg-white/20 text-white">
                                {widget.size}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-muted-foreground mb-4">
                              {config.description}
                            </p>
                            <Button
                              className="w-full"
                              onClick={() => {
                                // Navigate to micro-app
                                window.location.href = `/apps/${widget.widget_type}`;
                              }}
                            >
                              <span>App öffnen</span>
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {layout.filter(w => w.is_active).length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine aktiven Widgets im Dashboard.</p>
        </div>
      )}
    </div>
  );
}