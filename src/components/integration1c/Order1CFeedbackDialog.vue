<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";

import { useOrder1CFeedback } from "@/composables/useOrder1CFeedback";

const { t } = useI18n();
const { feedback } = useOrder1CFeedback();
</script>

<template>
	<Dialog
		v-model:visible="feedback.visible"
		:header="feedback.title"
		modal
		:style="{ width: '36rem', maxWidth: 'calc(100vw - 2rem)' }"
	>
		<Message :severity="feedback.severity" :closable="false">
			<p class="whitespace-pre-wrap break-words">
				{{ feedback.message }}
			</p>
		</Message>
		<template #footer>
			<Button
				:label="t('Order.feedback.close')"
				autofocus
				@click="feedback.visible = false"
			/>
		</template>
	</Dialog>
</template>
