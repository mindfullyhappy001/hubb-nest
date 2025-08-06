import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  category: string;
  distance_km: number | null;
  is_public: boolean;
  created_at: string;
}

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');

  const categories = ['Kultur', 'Sport', 'Musik', 'Food', 'Business', 'Social'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .or(`is_public.eq.true,user_id.eq.${user?.id}`)
        .order('event_date', { ascending: true });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Fehler beim Laden der Events",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    const matchesDistance = distanceFilter === 'all' || 
                           (distanceFilter === 'under5' && event.distance_km && event.distance_km <= 5) ||
                           (distanceFilter === 'under20' && event.distance_km && event.distance_km <= 20) ||
                           (distanceFilter === 'over20' && event.distance_km && event.distance_km > 20);

    return matchesSearch && matchesCategory && matchesDistance;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Event erstellen</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Events suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={distanceFilter} onValueChange={setDistanceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Entfernung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Entfernungen</SelectItem>
            <SelectItem value="under5">Unter 5 km</SelectItem>
            <SelectItem value="under20">Unter 20 km</SelectItem>
            <SelectItem value="over20">Über 20 km</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <Badge variant={event.is_public ? "default" : "secondary"}>
                  {event.is_public ? "Öffentlich" : "Privat"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{event.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{event.location}</span>
                  {event.distance_km && (
                    <span className="text-muted-foreground">({event.distance_km} km)</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(event.event_date).toLocaleDateString('de-DE')}</span>
                </div>
                
                <Badge variant="outline" className="w-fit">
                  {event.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Events gefunden.</p>
        </div>
      )}
    </div>
  );
}