/// <reference types="vite/client" />

// 环境变量配置
interface ImportMetaEnv {
    readonly VITE_APP_API_BASE_URL: string;
    readonly VITE_APP_TOKEN_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}