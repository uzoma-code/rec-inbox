export type RecType = "movie" | "show";
export type RecStatus = "to_watch" | "watched";
export type Rating = 1 | 2 | 3 | 4 | 5;

export type Rec = {
  id: string;
  title: string;
  type: RecType;
  recommender_name: string;
  status: RecStatus;
  rating: Rating | null;
  created_at: string;
  watched_at?: string | null;
  watch_providers?: string[];
  watch_providers_updated_at?: string | null;
  poster_url?: string | null;
  user_id?: string;
  is_seed?: boolean;
};

export type SimilarSuggestion = {
  source_title: string;
  title: string;
  type: RecType;
  reason?: string;
};

export type RecInput = {
  title: string;
  recommender_name: string;
  type: RecType;
};

export type ValidationResult =
  | { ok: true; value: RecInput }
  | { ok: false; errors: { title?: string; recommender_name?: string } };

export type SessionUser = {
  id: string;
  email: string;
};
