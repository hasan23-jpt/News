import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface NewArticleNotification {
  id: string;
  title: string;
  slug: string;
}

export function NotificationManager() {
  const lastCheckRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('public:articles')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'articles',
          filter: 'status=eq.published',
        },
        (payload) => {
          const article = payload.new as NewArticleNotification;
          if (!article || !article.title) return;

          if (Notification.permission === 'granted') {
            new Notification('ThePulse — Breaking News', {
              body: article.title,
              icon: '/vite.svg',
              tag: article.id,
            });
          }
        }
      )
      .subscribe();

    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-news`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.posted && data.posted > 0) {
            for (const article of data.articles) {
              if (Notification.permission === 'granted') {
                new Notification('ThePulse — Breaking News', {
                  body: article.title,
                  icon: '/vite.svg',
                  tag: article.slug,
                });
              }
            }
          }
        }
      } catch {
        // Network errors are non-fatal; next interval will retry
      }
      lastCheckRef.current = new Date().toISOString();
    }, 60 * 60 * 1000); // Every 1 hour (server-side cron also runs hourly)

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return null;
}
