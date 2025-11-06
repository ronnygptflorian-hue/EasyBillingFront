export interface ApiResponse<T> {
    messages: Message[],
    data: T,
    pagination?: Pagination
}

export interface Message{
    code: number,
    msg: string,
    stop: string,
    type: string
}

export interface Pagination {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;