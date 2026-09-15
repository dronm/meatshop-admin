const apiBase = import.meta.env.VITE_BASE_API ?? "";

export const API_BASE_URL = `${apiBase}/api`;
export const API_TIMEOUT = 1000;

export const WS_RECONNECT_INTERVAL = 5000;
export const WS_MAX_RECONNECT_TRIES = 20;
export const WS_URL = import.meta.env.VITE_BASE_WS || "/ws";
