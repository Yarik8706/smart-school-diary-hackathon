export type MaterialSource = "youtube" | "article";

export interface Material {
  id: string;
  title: string;
  source: MaterialSource;
  url: string;
  thumbnail?: string;
}
