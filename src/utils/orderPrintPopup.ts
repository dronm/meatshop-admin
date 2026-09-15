import { errorText } from "@katren/vue-collection-lib/utils/errorText";

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

type PrintTarget = "order" | "shipment";

interface PrintText {
	title: string;
	loading: string;
	error: string;
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

const printText = (
	target: PrintTarget,
	orderIDs: readonly number[],
): PrintText => {
	const singleOrderID = orderIDs.length === 1 ? orderIDs[0] : null;

	if (target === "shipment") {
		return {
			title:
				singleOrderID === null
					? `Печатные формы отгрузок (${orderIDs.length})`
					: `Печатная форма отгрузки по заказу №${singleOrderID}`,
			loading: "Получение печатной формы отгрузки из 1С...",
			error: "Не удалось получить печатную форму отгрузки.",
		};
	}

	return {
		title:
			singleOrderID === null
				? `Печатные формы заказов (${orderIDs.length})`
				: `Печатная форма заказа №${singleOrderID}`,
		loading: "Получение печатной формы заказа из 1С...",
		error: "Не удалось получить печатную форму заказа.",
	};
};

export const hasOrder1CReference = (value: unknown): boolean => {
	return normalizeRef1C(value) !== null;
};

const openPrintPopup = async (
	target: PrintTarget,
	orderIDs: readonly number[],
): Promise<void> => {
	if (
		orderIDs.length === 0 ||
		orderIDs.some((id) => !Number.isInteger(id) || id <= 0)
	) {
		return;
	}

	const text = printText(target, orderIDs);
	const geometry = getPopupGeometry();
	const popup = window.open(
		"",
		`${target}-print-${Date.now()}`,
		popupFeatures(geometry),
	);

	if (popup === null) {
		window.alert("Браузер заблокировал окно печатной формы.");
		return;
	}

	popup.focus();
	writeMessage(popup, text.title, text.loading);

	window.setTimeout(() => {
		if (!popup.closed) {
			applyPopupGeometry(popup, geometry);
		}
	}, 100);

	try {
		const pdf =
			target === "order"
				? await orderDocumentApi.printOrders1c(orderIDs)
				: await orderDocumentApi.printShipments1c(
						orderIDs,
					);
		if (popup.closed) {
			return;
		}

		const blobUrl = URL.createObjectURL(pdf);
		writePdf(popup, text.title, blobUrl);
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
				text.title,
				`${text.error}\n${errorText(error)}`,
				true,
			);
			applyPopupGeometry(popup, geometry);
			popup.focus();
		}
	}
};

export const openOrderPrintPopup = async (
	orderIDs: readonly number[],
): Promise<void> => {
	await openPrintPopup("order", orderIDs);
};

export const openShipmentPrintPopup = async (
	orderIDs: readonly number[],
): Promise<void> => {
	await openPrintPopup("shipment", orderIDs);
};
