export interface IResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
  path?: string;
}

export interface IPaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  error?: any;
  timestamp: string;
  path?: string;
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}