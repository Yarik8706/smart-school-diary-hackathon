export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown> | unknown;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
}
