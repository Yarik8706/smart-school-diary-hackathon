export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown> | FormData;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
}
