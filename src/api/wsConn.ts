import {
	WSManager,
	type WSManagerOptions,
} from "@katren/vue-collection-lib/api/wsManager";

import {
	WS_MAX_RECONNECT_TRIES,
	WS_RECONNECT_INTERVAL,
	WS_URL,
} from "@/config/constants";

declare global {
	interface Window {
		wsManager?: WSManager;
	}
}

const options: WSManagerOptions = {
	debug: import.meta.env.MODE === "development",
	reconnectInterval: WS_RECONNECT_INTERVAL,
	maxReconnectAttempts: WS_MAX_RECONNECT_TRIES,
};

// getWSManager returns one manager shared by the main window and its child tabs.
const getWSManager = (): WSManager => {
	if (window.opener?.wsManager) {
		return window.opener.wsManager;
	}

	window.wsManager ??= new WSManager(WS_URL, options);
	return window.wsManager;
};

const wsManager = getWSManager();

export default wsManager;
