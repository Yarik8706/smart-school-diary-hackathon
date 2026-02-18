import type { ApiRequestOptions } from "@/types/api";

import { resolveMockRequest } from "@/lib/mock-api-routes";

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

export const mockApiClient = {
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    await delay();
    return resolveMockRequest<T>(endpoint, options);
  },
  get<T>(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T>(
    endpoint: string,
    body?: ApiRequestOptions["body"],
    options: ApiRequestOptions = {},
  ) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  },
  put<T>(
    endpoint: string,
    body?: ApiRequestOptions["body"],
    options: ApiRequestOptions = {},
  ) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  },
  patch<T>(
    endpoint: string,
    body?: ApiRequestOptions["body"],
    options: ApiRequestOptions = {},
  ) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  },
  delete<T>(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
