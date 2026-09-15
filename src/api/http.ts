import {
	Conn,
	APIError,
	type ConnRequestOptions,
} from "@katren/vue-collection-lib/api/Conn";

import { API_BASE_URL, API_TIMEOUT } from "@/config/constants";

class ProjectConn extends Conn {
	isAuthed: boolean = false;
	unlogUser: (() => void) | null = null;

	constructor(baseURL: string, timeout: number) {
		super(baseURL, timeout);
	}

	public async getAttachment(
		endpoint: string,
		requestOptions: ConnRequestOptions = {},
	): Promise<Blob> {
		const timeout = requestOptions.timeout ?? this.timeout;
		const controller = new AbortController();
		let timeoutID: ReturnType<typeof setTimeout> | undefined;
		let timedOut = false;

		const abortRequest = (): void => {
			controller.abort();
		};

		if (requestOptions.signal !== undefined) {
			if (requestOptions.signal.aborted) {
				controller.abort();
			} else {
				requestOptions.signal.addEventListener("abort", abortRequest, {
					once: true,
				});
			}
		}

		if (timeout > 0) {
			timeoutID = setTimeout(() => {
				timedOut = true;
				controller.abort();
			}, timeout);
		}

		try {
			const response = await fetch(this.buildUrl(endpoint), {
				method: "GET",
				credentials: "include",
				signal: controller.signal,
				headers: {
					...this.defaultHTTPHeaders,
					Accept: "application/pdf",
					"X-Query-Id": `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
				},
			});

			if (!response.ok) {
				const body = await response.text();
				throw new APIError(
					body.trim() || `request error (${response.status})`,
					response.status,
					body,
				);
			}

			const contentType = response.headers.get("Content-Type") ?? "";
			if (!contentType.toLowerCase().includes("application/pdf")) {
				throw new APIError(
					`Unexpected print response content type: ${contentType || "unknown"}`,
					response.status,
				);
			}

			return await response.blob();
		} catch (error: unknown) {
			if (timedOut) {
				throw new APIError(`request timeout after ${timeout} ms`);
			}

			throw error;
		} finally {
			if (timeoutID !== undefined) {
				clearTimeout(timeoutID);
			}

			requestOptions.signal?.removeEventListener("abort", abortRequest);
		}
	}

	public put<T = unknown>(
		endpoint: string,
		data?: unknown,
		requestOptions: ConnRequestOptions = {},
	): Promise<T> {
		return this.request<T>(
			endpoint,
			{
				method: "PUT",
				body:
					data === undefined
						? undefined
						: JSON.stringify(data),
				headers: {
					...this.defaultHTTPHeaders,
					"Content-Type": "application/json",
					"X-Query-Id": `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
				},
			},
			requestOptions,
		);
	}

	protected override async request<T = unknown>(
		endpoint: string,
		options: RequestInit = {},
		requestOptions: ConnRequestOptions = {},
	): Promise<T> {
		try {
			return await super.request<T>(
				endpoint,
				{
					...options,
					credentials: "include",
				},
				requestOptions,
			);
		} catch (err: unknown) {
			if (
				this.response?.status === 401 &&
				this.isAuthed &&
				this.unlogUser !== null
			) {
				this.unlogUser();
				window.location.href = window.location.origin;
				throw new Error("Unauthorized");
			}

			if (err instanceof APIError) {
				throw err;
			}

			if (err instanceof Error) {
				throw new Error(err.message || "unknown error");
			}

			throw new Error(String(err));
		}
	}
}

const api = new ProjectConn(API_BASE_URL, API_TIMEOUT);

export default api;
