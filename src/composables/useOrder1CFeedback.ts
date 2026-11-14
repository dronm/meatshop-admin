import { reactive } from "vue";

interface Order1CFeedbackMessage {
	title: string;
	message: string;
	severity: "error" | "success";
}

const feedback = reactive<Order1CFeedbackMessage & { visible: boolean }>({
	visible: false,
	title: "",
	message: "",
	severity: "error",
});

export const showOrder1CFeedback = (message: Order1CFeedbackMessage): void => {
	Object.assign(feedback, message, { visible: true });
};

export const useOrder1CFeedback = () => ({ feedback });
