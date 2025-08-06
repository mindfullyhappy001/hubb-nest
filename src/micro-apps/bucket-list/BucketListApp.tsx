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
import { Plus, Check, Trash2, Edit } from 'lucide-react';

interface BucketListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  is_completed: boolean;
  target_date: string | null;
  created_at: string;
}

export default function BucketListApp() {
  const { user } = useAuth();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_date: ''
  });

  const categories = ['Reisen', 'Karriere', 'Fitness', 'Kreativ', 'Sozial', 'Bildung', 'Abenteuer'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('bucket_list_items')
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

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching bucket list items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      ...formData,
      user_id: user?.id,
      target_date: formData.target_date || null
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('bucket_list_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich aktualisiert",
          description: "Bucket List Eintrag wurde aktualisiert.",
        });
      } else {
        const { error } = await supabase
          .from('bucket_list_items')
          .insert([itemData]);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich erstellt",
          description: "Neuer Bucket List Eintrag wurde erstellt.",
        });
      }

      setFormData({ title: '', description: '', category: '', target_date: '' });
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleComplete = async (item: BucketListItem) => {
    try {
      const { error } = await supabase
        .from('bucket_list_items')
        .update({ is_completed: !item.is_completed })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: item.is_completed ? "Als offen markiert" : "Als erledigt markiert",
        description: `"${item.title}" wurde aktualisiert.`,
      });

      fetchItems();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bucket_list_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolgreich gelöscht",
        description: "Bucket List Eintrag wurde gelöscht.",
      });

      fetchItems();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      target_date: item.target_date ? item.target_date.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '', target_date: '' });
    setEditingItem(null);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Meine Bucket List</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Neues Ziel</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Ziel bearbeiten' : 'Neues Ziel hinzufügen'}
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
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                placeholder="Zieldatum (optional)"
              />
              
              <Button type="submit" className="w-full">
                {editingItem ? 'Aktualisieren' : 'Hinzufügen'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className={`transition-all ${item.is_completed ? 'opacity-75' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className={`text-lg ${item.is_completed ? 'line-through' : ''}`}>
                  {item.title}
                </CardTitle>
                <Badge variant={item.is_completed ? "default" : "secondary"}>
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{item.description}</p>
              
              {item.target_date && (
                <p className="text-sm text-muted-foreground mb-4">
                  Ziel: {new Date(item.target_date).toLocaleDateString('de-DE')}
                </p>
              )}
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={item.is_completed ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleComplete(item)}
                  className="flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{item.is_completed ? 'Rückgängig' : 'Erledigt'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(item)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Noch keine Ziele in deiner Bucket List.</p>
        </div>
      )}
    </div>
  );
}