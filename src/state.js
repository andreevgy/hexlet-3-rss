import onChange from "on-change";

export const createState = (i18next, elements, state) => {
	return onChange(state, (path) => {
		switch (path) {
			case "inputFeedback":
				if (state.inputFeedback === "success") {
					elements.input.classList.remove("is-invalid");
					elements.input.value = '';
					elements.input.focus();
					elements.inputFeedback.classList.add("text-success");
					elements.inputFeedback.classList.remove("text-danger");
					elements.inputFeedback.textContent = i18next.t(`successLoad`);
				} else {
					elements.input.classList.add("is-invalid");
					elements.inputFeedback.classList.remove("text-success");
					elements.inputFeedback.classList.add("text-danger");
					elements.inputFeedback.textContent = i18next.t(`errors.${state.inputFeedback}`);
				}
				break;
			default:
				break
		}
	});
};
