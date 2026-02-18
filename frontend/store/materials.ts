import { create } from "zustand";

import { api } from "@/lib/api-client";
import type { Material } from "@/types/materials";

export interface MaterialStore {
  materials: Material[];
  loading: boolean;
  error: string | null;
  searchMaterials: (query: string, subject?: string) => Promise<void>;
  fetchHomeworkMaterials: (homeworkId: string) => Promise<void>;
}

const searchPath = "/api/v1/materials/search";

const buildSearchUrl = (query: string, subject?: string) => {
  const params = new URLSearchParams({ query });

  if (subject) {
    params.set("subject", subject);
  }

  return `${searchPath}?${params.toString()}`;
};

export const useMaterialStore = create<MaterialStore>((set) => ({
  materials: [],
  loading: false,
  error: null,
  searchMaterials: async (query, subject) => {
    set({ loading: true });
    try {
      const materials = await api.get<Material[]>(buildSearchUrl(query, subject));
      set({ materials: Array.isArray(materials) ? materials : [], error: null });
    } catch {
      set({ error: "Не удалось загрузить материалы." });
    } finally {
      set({ loading: false });
    }
  },
  fetchHomeworkMaterials: async (homeworkId) => {
    set({ loading: true });
    try {
      const materials = await api.get<Material[]>(
        `/api/v1/homework/${homeworkId}/materials`,
      );
      set({ materials, error: null });
    } catch {
      set({ error: "Не удалось загрузить материалы." });
    } finally {
      set({ loading: false });
    }
  },
}));
