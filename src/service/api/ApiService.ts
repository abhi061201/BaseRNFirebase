import { Tag } from '@/core/types/loggerTags';
import { getBaseUrl } from '@/utils/env';
import logger from '@/utils/logger';
import networkService from '@/utils/network';
import axios, {AxiosError} from 'axios';


declare module 'axios' {
  export interface AxiosRequestConfig {
    skipSessionOutHandling?: boolean;
  }
}

// this instance will manage baseurl and it will be use everywhere
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Network Interceptor
axiosInstance.interceptors.request.use(
  config => {
    if (!networkService.getConnectionStatus()) {
      return Promise.reject({
        code: '401', //Constants.NETWORK_ERROR_CODE,
        message: 'No internet connection',
      });
    }
    logger.log(Tag.API, '🔍 Final Axios Request Config:', {
      method: config.method,
      url: config.baseURL + '' + config.url,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },

  error => {
    logger.log(Tag.API, 'error in network interceptor', JSON.stringify(error));
    return Promise.reject(error);
  },
);

/*
 Encryption Interceptor
axiosInstance.interceptors.request.use(
  async config => {
    try {
      const sessionId = config.data.pubInfo.sessionId;
      const busiParams = config.data.requestList[0].busiParams;
      const encryptRequest = await EncryptionInterceptor(busiParams, sessionId);
      config.data = {
        pubInfo: config.data.pubInfo,
        requestList: [
          { ...config.data.requestList[0], busiParams: encryptRequest },
        ],
      };
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => {
    return Promise.reject(error);
  },
);
*/

/*
 SessionOut Interceptor
axiosInstance.interceptors.response.use(
  config => {
    const { respInfo = {}, respData = [] } = config.data || {};
    const requestConfig = config.config;
    const skipSessionHandling = requestConfig.skipSessionOutHandling;

    const isSessionExpired =
      sessionOutCode.includes(respInfo?.code ?? '') ||
      (respData && respData[0] && sessionOutCode.includes(respData[0].code));
    const error = respInfo.code !== '0' ? respInfo : respData[0];
    if (isSessionExpired && !skipSessionHandling) {
      logger.log('SessionOut->Trigger');
      store.dispatch(setAuthState(AuthState.PENDING));
      handleSessionExpiry();
      return Promise.reject({ code: error.code, message: error.message });
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
*/

// API Error Handling Interceptor
// axiosInstance.interceptors.response.use(
//   config => {
//     const {respInfo = {}, respData = []} = config.data || {};

//     if (respInfo.code !== '0') {
//       return Promise.reject({code: respInfo.code, message: respInfo.message});
//     }

//     if (!respData || respData.length === 0) {
//       return Promise.reject({
//         code: '',
//         message: 'Empty Response data',
//       });
//     }

//     if (respData[0].code !== '0' || !respData[0].respMsg) {
//       return Promise.reject({
//         code: respData[0].code,
//         message: respData[0].message,
//       });
//     }

//     return config;
//   },
//   error => Promise.reject(error),
// );

/*
// Decryption Interceptor
axiosInstance.interceptors.response.use(
  async config => {
    try {
      const cipherData = config.data.respData[0].respMsg;
      const isDataEncrypted = config.data.respData[0].isEncrypt;
      const sessionId = JSON.parse(config.config.data).pubInfo.sessionId;

      const decryptedResponse = await DecryptionInterceptor(
        cipherData,
        isDataEncrypted,
        sessionId,
      );
      config.data = {
        respInfo: config.data.respInfo,
        respData: [{ ...config.data.respData[0], respMsg: decryptedResponse }],
      };
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => {
    return Promise.reject(error);
  },
);
*/

export function ApiService<T, R>(
  requestData: T,
  endPoint: string,
  method: string,
  params?: any,
): Promise<R> {
  const apiData = new Promise<R>((resolve, reject) => {
    axiosInstance
      .request<R>({
        url: endPoint,
        method: method,
        ...(method.toLowerCase() === 'get'
          ? {params: params}
          : {data: requestData}),
      })
      .then(response => {
        logger.log(Tag.API, 'Response', JSON.stringify(response.data));
        if (response.status === 200) {
          resolve(response.data as R);
        } else {
          reject(response.data as R);
        }
      })
      .catch(error => {
        logger.log(Tag.API, 'Error in api calling', JSON.stringify(error));
        reject({code: 'axios_error', message: error?.message} as AxiosError);
      });
  });
  return apiData;
}

export default ApiService;