import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Calendar, Edit, Trash2, Star } from 'lucide-react';

interface DatingJournalEntry {
  id: string;
  person_name: string;
  date: string;
  location: string;
  experience_rating: number;
  notes: string;
  will_see_again: boolean | null;
  created_at: string;
}

export default function DatingJournalApp() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DatingJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DatingJournalEntry | null>(null);
  const [formData, setFormData] = useState({
    person_name: '',
    date: '',
    location: '',
    experience_rating: 5,
    notes: '',
    will_see_again: null as boolean | null
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('dating_journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) {
        toast({
          title: "Fehler beim Laden",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching dating journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData = {
      ...formData,
      user_id: user?.id
    };

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('dating_journal_entries')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich aktualisiert",
          description: "Dating Eintrag wurde aktualisiert.",
        });
      } else {
        const { error } = await supabase
          .from('dating_journal_entries')
          .insert([entryData]);

        if (error) throw error;
        
        toast({
          title: "Erfolgreich erstellt",
          description: "Neuer Dating Eintrag wurde erstellt.",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchEntries();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dating_journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolgreich gelöscht",
        description: "Dating Eintrag wurde gelöscht.",
      });

      fetchEntries();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (entry: DatingJournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      person_name: entry.person_name,
      date: entry.date,
      location: entry.location,
      experience_rating: entry.experience_rating,
      notes: entry.notes,
      will_see_again: entry.will_see_again
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      person_name: '',
      date: '',
      location: '',
      experience_rating: 5,
      notes: '',
      will_see_again: null
    });
    setEditingEntry(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dating Journal</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Neuer Eintrag</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Eintrag bearbeiten' : 'Neuen Eintrag hinzufügen'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name der Person"
                value={formData.person_name}
                onChange={(e) => setFormData(prev => ({ ...prev, person_name: e.target.value }))}
                required
              />
              
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              
              <Input
                placeholder="Ort"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bewertung: {formData.experience_rating}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.experience_rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_rating: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <Textarea
                placeholder="Notizen zur Erfahrung"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                required
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Wiedersehen?</label>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={formData.will_see_again === true ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, will_see_again: true }))}
                    className="flex-1"
                  >
                    Ja
                  </Button>
                  <Button
                    type="button"
                    variant={formData.will_see_again === false ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, will_see_again: false }))}
                    className="flex-1"
                  >
                    Nein
                  </Button>
                  <Button
                    type="button"
                    variant={formData.will_see_again === null ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, will_see_again: null }))}
                    className="flex-1"
                  >
                    Unentschieden
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                {editingEntry ? 'Aktualisieren' : 'Hinzufügen'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <Card key={entry.id} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{entry.person_name}</CardTitle>
                <div className="flex space-x-1">
                  {renderStars(entry.experience_rating)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(entry.date).toLocaleDateString('de-DE')}</span>
                </div>
                
                <p className="text-sm"><strong>Ort:</strong> {entry.location}</p>
                
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Wiedersehen:</span>
                  <Badge 
                    variant={
                      entry.will_see_again === true ? "default" :
                      entry.will_see_again === false ? "destructive" : "secondary"
                    }
                  >
                    {entry.will_see_again === true ? "Ja" :
                     entry.will_see_again === false ? "Nein" : "Unentschieden"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(entry)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteEntry(entry.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Noch keine Einträge im Dating Journal.</p>
        </div>
      )}
    </div>
  );
}