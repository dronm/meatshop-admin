<script setup lang="ts">
import {
	CurrentUserProfileView,
	type UserProfile,
} from "@katren/vue-business-app/user";

import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();

const handleUpdated = (
	profile: UserProfile,
): void => {
	authStore.updateCurrentUserProfile(profile);
};
</script>

<template>
	<CurrentUserProfileView @updated="handleUpdated" />
</template>
