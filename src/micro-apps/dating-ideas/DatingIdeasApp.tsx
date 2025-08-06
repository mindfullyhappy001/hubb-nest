import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Heart, MapPin, DollarSign, Clock, Edit, Trash2, Shuffle } from 'lucide-react';

interface DatingIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_cost: string;
  estimated_duration: string;
  location_type: string;
  is_favorite: boolean;
  created_at: string;
}

export default function DatingIdeasApp() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<DatingIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<DatingIdea | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimated_cost: '',
    estimated_duration: '',
    location_type: ''
  });

  const categories = ['Romantisch', 'Abenteuer', 'Kultur', 'Sport', 'Kulinarisch', 'Entspannung', 'Kreativ'];
  const costRanges = ['Kostenlos', 'Unter 20€', '20-50€', '50-100€', 'Über 100€'];
  const durations = ['Unter 1h', '1-3h', '3-5h', 'Halber Tag', 'Ganzer Tag', 'Wochenende'];
  const locationTypes = ['Drinnen', 'Draußen', 'Zuhause', 'Restaurant', 'Bar', 'Aktivität'];

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('dating_ideas')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Fehler beim Laden",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching dating ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ideaData = {
      ...formData,
      user_id: user?.id
    };

    try {
      if (editingIdea) {
        const { error } = await supabase
          .from('dating_ideas')
          .update(ideaData)
          .eq('id', editingIdea.id);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich aktualisiert",
          description: "Dating Idee wurde aktualisiert.",
        });
      } else {
        const { error } = await supabase
          .from('dating_ideas')
          .insert([ideaData]);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich erstellt",
          description: "Neue Dating Idee wurde erstellt.",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchIdeas();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (idea: DatingIdea) => {
    try {
      const { error } = await supabase
        .from('dating_ideas')
        .update({ is_favorite: !idea.is_favorite })
        .eq('id', idea.id);

      if (error) throw error;

      toast({
        title: idea.is_favorite ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt",
        description: `"${idea.title}" wurde aktualisiert.`,
      });

      fetchIdeas();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dating_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolgreich gelöscht",
        description: "Dating Idee wurde gelöscht.",
      });

      fetchIdeas();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRandomIdea = () => {
    const filteredIdeas = categoryFilter === 'all' 
      ? ideas 
      : ideas.filter(idea => idea.category === categoryFilter);
    
    if (filteredIdeas.length === 0) {
      toast({
        title: "Keine Ideen gefunden",
        description: "Keine Dating Ideen in der ausgewählten Kategorie.",
        variant: "destructive",
      });
      return;
    }

    const randomIdea = filteredIdeas[Math.floor(Math.random() * filteredIdeas.length)];
    toast({
      title: "Zufällige Dating Idee",
      description: `${randomIdea.title} - ${randomIdea.category}`,
    });
  };

  const startEdit = (idea: DatingIdea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      estimated_cost: idea.estimated_cost,
      estimated_duration: idea.estimated_duration,
      location_type: idea.location_type
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      estimated_cost: '',
      estimated_duration: '',
      location_type: ''
    });
    setEditingIdea(null);
  };

  const filteredIdeas = categoryFilter === 'all' 
    ? ideas 
    : ideas.filter(idea => idea.category === categoryFilter);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dating Ideen</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={getRandomIdea}
            className="flex items-center space-x-2"
          >
            <Shuffle className="w-4 h-4" />
            <span>Zufällige Idee</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Neue Idee</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIdea ? 'Idee bearbeiten' : 'Neue Idee hinzufügen'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Titel"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <Textarea
                  placeholder="Beschreibung"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
                
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.estimated_cost}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, estimated_cost: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Geschätzte Kosten" />
                  </SelectTrigger>
                  <SelectContent>
                    {costRanges.map(cost => (
                      <SelectItem key={cost} value={cost}>{cost}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.estimated_duration}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, estimated_duration: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Geschätzte Dauer" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map(duration => (
                      <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.location_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location_type: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ort-Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button type="submit" className="w-full">
                  {editingIdea ? 'Aktualisieren' : 'Hinzufügen'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => (
          <Card key={idea.id} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(idea)}
                  className={idea.is_favorite ? 'text-red-500' : 'text-gray-400'}
                >
                  <Heart className={`w-4 h-4 ${idea.is_favorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{idea.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{idea.estimated_cost}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{idea.estimated_duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{idea.location_type}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline">{idea.category}</Badge>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(idea)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteIdea(idea.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {categoryFilter === 'all' 
              ? 'Noch keine Dating Ideen vorhanden.' 
              : `Keine Dating Ideen in der Kategorie "${categoryFilter}".`
            }
          </p>
        </div>
      )}
    </div>
  );
}