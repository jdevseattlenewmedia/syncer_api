import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Axios instance with default configuration
const instance = axios.create();

// Function to handle Axios requests
const axiosRequest = async (
  options: AxiosRequestConfig
): Promise<AxiosResponse> => {
  try {
    const response = await instance(options);
    return response;
  } catch (error) {
    //@ts-ignore eslint-disable-next-line no-console
    console.log("from helper:", { error: error?.response?.data });
    throw error;
  }
};

export default axiosRequest;
