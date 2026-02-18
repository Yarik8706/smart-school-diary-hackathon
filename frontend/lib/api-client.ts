import { mockApiClient } from "@/lib/mock-api-client";
import type { ApiErrorPayload, ApiRequestOptions } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const buildHeaders = (
  body: ApiRequestOptions["body"],
  initHeaders?: HeadersInit,
): HeadersInit => {
  if (body instanceof FormData) {
    return initHeaders ?? {};
  }

  return {
    "Content-Type": "application/json",
    ...initHeaders,
  };
};

const buildBody = (body: ApiRequestOptions["body"]): BodyInit | undefined => {
  if (!body) {
    return undefined;
  }

  return body instanceof FormData ? body : JSON.stringify(body);
};

const buildError = async (response: Response): Promise<ApiErrorPayload> => {
  const fallbackMessage = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as {
      detail?: string;
      message?: string;
    };
    return {
      message: payload.detail ?? payload.message ?? fallbackMessage,
      status: response.status,
    };
  } catch {
    return {
      message: fallbackMessage,
      status: response.status,
    };
  }
};

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: buildHeaders(options.body, options.headers),
      body: buildBody(options.body),
    });

    if (!response.ok) {
      throw await buildError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
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


const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const api = useMock ? mockApiClient : apiClient;
