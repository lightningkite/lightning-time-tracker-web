// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_HTTP_URL: string
  // add more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
