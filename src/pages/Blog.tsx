import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  is_published: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export default function Blog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .or(`is_published.eq.true,user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Fehler beim Laden der Blog Posts",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blog</h1>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Neuer Beitrag</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <Badge variant={post.is_published ? "default" : "secondary"}>
                  {post.is_published ? "Veröffentlicht" : "Entwurf"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.content.substring(0, 200)}...
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{post.author}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Noch keine Blog Posts vorhanden.</p>
        </div>
      )}
    </div>
  );
}