import dataProviderSimpleRest from '@refinedev/simple-rest';
import type { DataProvider } from '@refinedev/core';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider: DataProvider = dataProviderSimpleRest(API_URL, axiosInstance);
