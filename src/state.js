import onChange from "on-change";

export const createState = (i18next, elements) => {
	return onChange({
		inputError: null,
		rssList: [],
	}, (path, value) => {
		if (path === "inputError") {
			if (value === null) {
				elements.input.classList.remove("is-invalid");
				elements.input.value = "";
				elements.inputError.textContent = '';
			} else {
				elements.input.classList.add("is-invalid");
				elements.inputError.textContent = i18next.t([`errors.${value}`]);
			}
		}
	});
};
