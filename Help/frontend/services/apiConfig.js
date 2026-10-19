const DEFAULT_API_BASE_URL = 'http://localhost:8080';

export const normalizeApiBaseUrl = (value = DEFAULT_API_BASE_URL) => {
  const configuredValue = value?.trim() || DEFAULT_API_BASE_URL;
  return configuredValue.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env?.VITE_API_URL);

export const buildApiUrl = (path, baseUrl = API_BASE_URL) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeApiBaseUrl(baseUrl)}${normalizedPath}`;
};

