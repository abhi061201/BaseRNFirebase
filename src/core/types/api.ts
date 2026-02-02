export interface ApiLoading {
    state: ApiStatus.LOADING;
  }
  export interface ApiSuccess<R> {
    state: ApiStatus.SUCCESS;
    data: R;
  }
  
  export interface ApiError {
    state: ApiStatus.ERROR;
    error: ErrorType;
  }
  export interface ApiException {
    state: ApiStatus.EXCEPTION;
  }
  
  export enum ApiStatus {
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error',
    EXCEPTION = 'exception',
  }
  
  export interface ErrorType {
    code: string;
    message: string;
  }
  
  export type ApiState<R> = ApiLoading | ApiSuccess<R> | ApiError | ApiException;