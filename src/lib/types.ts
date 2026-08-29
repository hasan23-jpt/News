export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Profile {
  id: string;
  role: string;
  created_at: string;
}

export type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at: string | null;
};
