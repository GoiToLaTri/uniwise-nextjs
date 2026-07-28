export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface EmptyApiResponse {
  code: string;
  message: string;
  data?: never;
}
