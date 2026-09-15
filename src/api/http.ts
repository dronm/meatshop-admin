import {
	Conn,
	APIError,
	apiErrorMessageFromBody,
	type ConnRequestOptions,
} from "@katren/vue-collection-lib/api/Conn";

import { API_BASE_URL, API_TIMEOUT } from "@/config/constants";

class ProjectConn extends Conn {
	isAuthed: boolean = false;
	unlogUser: (() => void) | null = null;

	constructor(baseURL: string, timeout: number) {
		super(baseURL, timeout);
	}

	private async requestAttachment(
		endpoint: string,
		method: "GET" | "POST",
		data: unknown,
		requestOptions: ConnRequestOptions = {},
	): Promise<Blob> {
		const timeout = requestOptions.timeout ?? this.timeout;
		const controller = new AbortController();
		let timeoutID: ReturnType<typeof setTimeout> | undefined;
		let timedOut = false;
		let responseStatus = 0;

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
				method,
				credentials: "include",
				signal: controller.signal,
				body:
					method === "POST" && data !== undefined
						? JSON.stringify(data)
						: undefined,
				headers: {
					...this.defaultHTTPHeaders,
					Accept: "application/pdf",
					...(method === "POST"
						? {
								"Content-Type":
									"application/json",
							}
						: {}),
					"X-Query-Id": `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
				},
			});
			responseStatus = response.status;

			if (!response.ok) {
				const rawBody = await response.text();
				let body: unknown = rawBody.trim() || null;
				const contentType =
					response.headers.get("Content-Type") ??
					"";

				if (
					body !== null &&
					contentType
						.toLowerCase()
						.includes("application/json")
				) {
					try {
						body = JSON.parse(
							rawBody,
						) as unknown;
					} catch {
						// Keep the response text when an upstream returns invalid JSON.
					}
				}

				this.response = {
					body,
					status: response.status,
					headers: response.headers,
					attachment: undefined,
				};
				throw new APIError(
					apiErrorMessageFromBody(
						body,
						response.status,
					),
					response.status,
					body,
				);
			}

			const contentType =
				response.headers.get("Content-Type") ?? "";
			if (
				!contentType
					.toLowerCase()
					.includes("application/pdf")
			) {
				const body = await response.text();
				this.response = {
					body,
					status: response.status,
					headers: response.headers,
					attachment: undefined,
				};
				throw new APIError(
					`Unexpected print response content type: ${contentType || "unknown"}`,
					response.status,
					body,
				);
			}

			const attachment = await response.blob();
			this.response = {
				body: null,
				status: response.status,
				headers: response.headers,
				attachment,
			};

			return attachment;
		} catch (error: unknown) {
			if (timedOut) {
				throw new APIError(`request timeout after ${timeout} ms`);
			}

			if (
				responseStatus === 401 &&
				this.isAuthed &&
				this.unlogUser !== null
			) {
				this.unlogUser();
				window.location.href = window.location.origin;
				throw new Error("Unauthorized");
			}

			throw error;
		} finally {
			if (timeoutID !== undefined) {
				clearTimeout(timeoutID);
			}

			requestOptions.signal?.removeEventListener("abort", abortRequest);
		}
	}

	public async getAttachment(
		endpoint: string,
		requestOptions: ConnRequestOptions = {},
	): Promise<Blob> {
		return await this.requestAttachment(
			endpoint,
			"GET",
			undefined,
			requestOptions,
		);
	}

	public async postAttachment(
		endpoint: string,
		data: unknown,
		requestOptions: ConnRequestOptions = {},
	): Promise<Blob> {
		return await this.requestAttachment(
			endpoint,
			"POST",
			data,
			requestOptions,
		);
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
