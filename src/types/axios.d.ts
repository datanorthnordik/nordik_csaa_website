import 'axios'

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'axios' {
  export interface AxiosRequestConfig<D = unknown> {
    skipAuth?: boolean
    skipErrorToast?: boolean
    _retry?: boolean
  }

  export interface InternalAxiosRequestConfig<D = unknown> {
    skipAuth?: boolean
    skipErrorToast?: boolean
    _retry?: boolean
  }
}
