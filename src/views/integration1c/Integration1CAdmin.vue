<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import Message from "primevue/message";

import {
	integration1cAdminApi,
	type Integration1CAdminCommand,
	type Integration1CAdminResponse,
} from "@/api/integration1cAdmin";

interface CommandResult {
	response: Integration1CAdminResponse | null;
	error: string;
	checkedAt: string;
}

const commands: {
	command: Integration1CAdminCommand;
	label: string;
	method: string;
}[] = [
	{ command: "health", label: "Проверить доступность", method: "GET" },
	{ command: "status", label: "Получить состояние", method: "GET" },
	{ command: "stop", label: "Остановить", method: "POST" },
	{ command: "start", label: "Запустить", method: "POST" },
];

const results = ref<Partial<Record<Integration1CAdminCommand, CommandResult>>>(
	{},
);
const busy = ref<Integration1CAdminCommand | "refresh" | null>(null);

const request = async (command: Integration1CAdminCommand): Promise<void> => {
	let response: Integration1CAdminResponse | null = null;
	let error = "";
	try {
		response = await integration1cAdminApi.run(command);
	} catch (cause: unknown) {
		error = cause instanceof Error ? cause.message : String(cause);
	}
	results.value[command] = {
		response,
		error,
		checkedAt: new Date().toLocaleString("ru-RU"),
	};
};

const refreshState = async (): Promise<void> => {
	await Promise.all([request("health"), request("status")]);
};

const refresh = async (): Promise<void> => {
	if (busy.value !== null) {
		return;
	}
	busy.value = "refresh";
	try {
		await refreshState();
	} finally {
		busy.value = null;
	}
};

const run = async (command: Integration1CAdminCommand): Promise<void> => {
	if (busy.value !== null) {
		return;
	}
	busy.value = command;
	try {
		await request(command);
		if (command === "start" || command === "stop") {
			await refreshState();
		}
	} finally {
		busy.value = null;
	}
};

const formatBody = (body: unknown): string => {
	if (typeof body === "string") {
		return body;
	}
	return JSON.stringify(body, null, 2) ?? "";
};

const isFailure = (
	response: Integration1CAdminResponse | null | undefined,
): boolean => {
	if (!response) {
		return false;
	}
	if (response.status_code < 200 || response.status_code >= 300) {
		return true;
	}
	return (
		typeof response.body === "object" &&
		response.body !== null &&
		"success" in response.body &&
		response.body.success === false
	);
};

onMounted(refresh);
</script>

<template>
	<section class="mx-auto w-full max-w-5xl space-y-5 p-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-xl font-semibold">
				Управление интеграцией 1С
			</h1>
			<Button
				label="Обновить состояние"
				icon="pi pi-refresh"
				severity="secondary"
				:loading="busy === 'refresh'"
				:disabled="busy !== null"
				@click="refresh"
			/>
		</div>
		<p class="text-sm text-surface-600">
			После изменения обработки WebAPI остановите и запустите
			подключение к 1С. После команды состояние обновляется
			автоматически.
		</p>
		<div
			class="grid gap-4 md:grid-cols-2"
			aria-live="polite"
			:aria-busy="busy !== null"
		>
			<article
				v-for="item in commands"
				:key="item.command"
				class="min-w-0 space-y-3 rounded-lg border border-surface-200 bg-white p-4"
			>
				<div
					class="flex flex-wrap items-center justify-between gap-3"
				>
					<h2 class="font-semibold">
						{{ item.label }}
					</h2>
					<Button
						:label="item.label"
						:severity="
							item.command === 'stop'
								? 'danger'
								: item.command ===
									  'start'
									? 'success'
									: 'secondary'
						"
						:loading="busy === item.command"
						:disabled="busy !== null"
						@click="run(item.command)"
					/>
				</div>
				<p class="text-sm text-surface-500">
					{{ item.method }} /{{ item.command }}
				</p>
				<template v-if="results[item.command]">
					<p class="text-xs text-surface-500">
						{{
							results[item.command]
								?.checkedAt
						}}
					</p>
					<Message
						v-if="
							results[item.command]
								?.error
						"
						severity="error"
						:closable="false"
					>
						{{
							results[item.command]
								?.error
						}}
					</Message>
					<template
						v-if="
							results[item.command]
								?.response
						"
					>
						<Message
							:severity="
								isFailure(
									results[
										item
											.command
									]
										?.response,
								)
									? 'error'
									: 'success'
							"
							:closable="false"
						>
							HTTP
							{{
								results[
									item
										.command
								]?.response
									?.status_code
							}}
						</Message>
						<pre
							class="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-surface-50 p-3 text-xs"
							>{{
								formatBody(
									results[
										item
											.command
									]
										?.response
										?.body,
								)
							}}</pre
						>
					</template>
				</template>
				<p v-else class="text-sm text-surface-400">
					Команда ещё не выполнялась.
				</p>
			</article>
		</div>
	</section>
</template>
