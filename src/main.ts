import { createApp } from "vue";
import { createPinia } from "pinia";
import { createBusinessApp } from "@katren/vue-business-app/core";

import "primeicons/primeicons.css";
import "./style.css";
import "./styles/compact-grid.css";

import App from "./App.vue";
import { businessAppConfig } from "./config/businessApp";
import router from "./router";

import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import Aura from "@primeuix/themes/aura";
import { ru } from "primelocale/js/ru.js";

import { i18n } from "./i18n";
import { provideWSManager } from "@katren/vue-collection-lib/api/wsProvider";
import wsManager from "./api/wsConn";

const app = createApp(App);

provideWSManager(app, wsManager);

app.use(createPinia());
app.use(i18n);
app.use(createBusinessApp(businessAppConfig));
app.use(router);

app.use(PrimeVue, {
	theme: {
		preset: Aura,
	},
	locale: {
		...ru,
		dateFormat: "dd.mm.yy",
		firstDayOfWeek: 1,
	},
});
app.use(ConfirmationService);

app.mount("#app");
