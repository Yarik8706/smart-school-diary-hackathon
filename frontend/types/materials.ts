export type MaterialSource = "youtube" | "article" | "website";

export interface Material {
  title: string;
  source: MaterialSource;
  url: string;
  description?: string;
  thumbnail_url?: string;
}

export interface AIMaterialsResponse {
  materials: Material[];
  recommendation: string;
}
