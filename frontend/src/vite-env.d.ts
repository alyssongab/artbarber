/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_CLIENT_PAGINATION: number,
  readonly VITE_BARBER_PAGINATION: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}