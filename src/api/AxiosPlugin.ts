import _Vue from "vue";
import Axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";
import Shared from "@/common/shared";

export function getBaseUrl(): string {
  return Shared.APIBaseURL;
}

function generateAxiosInstance(): AxiosInstance {
  const axios = Axios.create({
    transformResponse: (data: any): any => {
      let res: any = data;
      try {
        if (typeof data !== "string") {
          // data is not string, cant pass it, return as is now.
          return data;
        }
        res = JSON.parse(data);
      } catch (ex) {
        // TODO: log error
        try {
          // custom parse failed, just use default parse
          res = JSON.parse(data);
        } catch (iex) {
          // TODO: log error
          // default parse also failed, return data as was
          res = data;
        }
      }
      return res;
    },
    validateStatus: (status: number) =>
      (status >= 200 && status < 300) || [404, 400, 409].indexOf(status) > -1,
  });

  axios.interceptors.request.use((config: AxiosRequestConfig) => {
    if (!config.headers.Authorization) {
      config.headers.Authorization =
        "bearer " + localStorage.getItem(Shared.lsTokenName);
    }
    // make sure base URL is set
    config.baseURL = getBaseUrl();
    return config;
  });

  axios.interceptors.response.use(
    (res: AxiosResponse<any>) => {
      // res.data = res.data;
      return res;
    },
    (error: any) => {
      // bubble up rejection
      return Promise.reject(error);
    },
  );

  // return instance
  return axios;
}

const axiosInstance = generateAxiosInstance();
export default axiosInstance;
