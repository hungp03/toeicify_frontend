export interface PaginationMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface PaginationResponse<T = any> {
  meta: PaginationMeta;
  result: T[];
}