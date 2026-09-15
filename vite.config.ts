import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		vue(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
		dedupe: [
			"vue",
			"pinia",
			"vue-router",
			"vue-i18n",
			"maska",
		],
	},
	optimizeDeps: {
		exclude: [
			"@katren/vue-collection-lib",
		],
	},
});
