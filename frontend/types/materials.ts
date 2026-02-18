export type MaterialSource = "youtube" | "article" | "website";

export interface Material {
  id: string;
  title: string;
  source: MaterialSource;
  url: string;
  description?: string;
  thumbnail?: string;
}

export interface AIMaterialsResponse {
  materials: Material[];
  recommendation: string;
}
