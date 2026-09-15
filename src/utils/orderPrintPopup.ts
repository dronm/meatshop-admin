import { orderDocumentApi } from "@/api/orderDocument";
import { normalizeRef1C } from "@/utils/ref1c";

const POPUP_VERTICAL_MARGIN = 50;
const POPUP_MIN_WIDTH = 360;
const POPUP_MIN_HEIGHT = 300;

interface PopupGeometry {
	width: number;
	height: number;
	left: number;
	top: number;
}

const getPopupGeometry = (): PopupGeometry => {
	const openerWidth = Math.max(window.outerWidth, window.innerWidth);
	const openerHeight = Math.max(window.outerHeight, window.innerHeight);
	const width = Math.max(
		POPUP_MIN_WIDTH,
		Math.round(openerWidth / 3),
	);
	const height = Math.max(
		POPUP_MIN_HEIGHT,
		openerHeight - POPUP_VERTICAL_MARGIN * 2,
	);
	const openerLeft = Number.isFinite(window.screenX) ? window.screenX : window.screenLeft;
	const openerTop = Number.isFinite(window.screenY) ? window.screenY : window.screenTop;
	const left = Math.max(
		0,
		Math.round(openerLeft + (openerWidth - width) / 2),
	);
	const top = Math.max(
		0,
		Math.round(openerTop + POPUP_VERTICAL_MARGIN),
	);

	return {
		width,
		height,
		left,
		top,
	};
};

const popupFeatures = (geometry: PopupGeometry): string => {
	return [
		"popup=yes",
		`width=${geometry.width}`,
		`height=${geometry.height}`,
		`left=${geometry.left}`,
		`top=${geometry.top}`,
		"resizable=yes",
		"scrollbars=yes",
	].join(",");
};

const applyPopupGeometry = (
	popup: Window,
	geometry: PopupGeometry,
): void => {
	try {
		popup.resizeTo(geometry.width, geometry.height);
		popup.moveTo(geometry.left, geometry.top);
	} catch {
		// Some browser policies can reject scripted resize/move. The dimensions
		// are also supplied to window.open(), so no further fallback is needed.
	}
};

const writeMessage = (
	popup: Window,
	title: string,
	message: string,
	isError = false,
): void => {
	popup.document.open();
	popup.document.write(`<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		html, body { height: 100%; margin: 0; }
		body { display: flex; align-items: center; justify-content: center; font-family: sans-serif; background: #f8fafc; color: #334155; }
		.message { max-width: 36rem; padding: 1.5rem; text-align: center; white-space: pre-wrap; }
		.message.error { color: #b91c1c; }
	</style>
</head>
<body>
	<div id="message" class="message"></div>
</body>
</html>`);
	popup.document.close();
	popup.document.title = title;

	const messageElement = popup.document.getElementById("message");
	if (messageElement !== null) {
		messageElement.textContent = message;
		if (isError) {
			messageElement.classList.add("error");
		}
	}
};

const writePdf = (
	popup: Window,
	title: string,
	blobUrl: string,
): void => {
	popup.document.open();
	popup.document.write(`<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		html, body, iframe { width: 100%; height: 100%; margin: 0; border: 0; overflow: hidden; }
	</style>
</head>
<body>
	<iframe id="pdf" title="PDF"></iframe>
</body>
</html>`);
	popup.document.close();
	popup.document.title = title;

	const frame = popup.document.getElementById("pdf");
	if (frame !== null && frame.tagName === "IFRAME") {
		(frame as HTMLIFrameElement).src = blobUrl;
	}
};

const errorText = (error: unknown): string => {
	if (error instanceof Error && error.message.trim() !== "") {
		return error.message;
	}

	return String(error);
};

export const hasOrder1CReference = (value: unknown): boolean => {
	return normalizeRef1C(value) !== null;
};

export const openOrderPrintPopup = async (orderId: number): Promise<void> => {
	if (!Number.isInteger(orderId) || orderId <= 0) {
		return;
	}

	const title = `Печатная форма заказа №${orderId}`;
	const geometry = getPopupGeometry();
	const popup = window.open(
		"",
		`order-print-${orderId}-${Date.now()}`,
		popupFeatures(geometry),
	);

	if (popup === null) {
		window.alert("Браузер заблокировал окно печатной формы.");
		return;
	}

	//applyPopupGeometry(popup, geometry);
	popup.focus();
	writeMessage(popup, title, "Получение печатной формы из 1С...");
	//applyPopupGeometry(popup, geometry);

	window.setTimeout(() => {
		if (!popup.closed) {
			applyPopupGeometry(popup, geometry);
		}
	}, 100);

	try {
		const pdf = await orderDocumentApi.print1c({ id: orderId });
		if (popup.closed) {
			return;
		}

		const blobUrl = URL.createObjectURL(pdf);
		writePdf(popup, title, blobUrl);
		applyPopupGeometry(popup, geometry);
		popup.focus();

		const cleanupTimer = window.setInterval(() => {
			if (!popup.closed) {
				return;
			}

			window.clearInterval(cleanupTimer);
			URL.revokeObjectURL(blobUrl);
		}, 1_000);
	} catch (error: unknown) {
		if (!popup.closed) {
			writeMessage(
				popup,
				title,
				`Не удалось получить печатную форму.\n${errorText(error)}`,
				true,
			);
			applyPopupGeometry(popup, geometry);
			popup.focus();
		}
	}
};
