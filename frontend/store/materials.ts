import { create } from "zustand";

import { api } from "@/lib/api-client";
import type { AIMaterialsResponse, Material } from "@/types/materials";

export interface MaterialStore {
  materials: Material[];
  recommendation: string;
  loading: boolean;
  error: string | null;
  searchMaterials: (query: string, subject?: string) => Promise<void>;
  fetchHomeworkMaterials: (homeworkId: string) => Promise<void>;
}

const searchPath = "/api/v1/materials/search";

const buildSearchUrl = (query: string, subject?: string) => {
  const params = new URLSearchParams({ query });

  if (subject) {
    params.set("subject_id", subject);
  }

  return `${searchPath}?${params.toString()}`;
};

const normalizeResponse = (payload: AIMaterialsResponse): AIMaterialsResponse => ({
  materials: Array.isArray(payload.materials) ? payload.materials : [],
  recommendation: payload.recommendation ?? "",
});

export const useMaterialStore = create<MaterialStore>((set) => ({
  materials: [],
  recommendation: "",
  loading: false,
  error: null,
  searchMaterials: async (query, subject) => {
    set({ loading: true });
    try {
      const response = await api.get<AIMaterialsResponse>(buildSearchUrl(query, subject));
      const normalized = normalizeResponse(response);
      set({
        materials: normalized.materials,
        recommendation: normalized.recommendation,
        error: null,
      });
    } catch {
      set({ error: "Не удалось загрузить материалы." });
    } finally {
      set({ loading: false });
    }
  },
  fetchHomeworkMaterials: async (homeworkId) => {
    set({ loading: true });
    try {
      const response = await api.get<AIMaterialsResponse>(`/api/v1/homework/${homeworkId}/materials`);
      const normalized = normalizeResponse(response);
      set({
        materials: normalized.materials,
        recommendation: normalized.recommendation,
        error: null,
      });
    } catch {
      set({ error: "Не удалось загрузить материалы." });
    } finally {
      set({ loading: false });
    }
  },
}));
