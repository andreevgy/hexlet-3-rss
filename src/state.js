import onChange from "on-change";

export const createState = (i18next) => {
	const input = document.querySelector("#url-input");
	const errorContainer = document.querySelector("#error-container");

	return onChange({
		inputError: null,
		rssList: [],
	}, (path, value) => {
		if (path === "inputError") {
			if (value === null) {
				input.className = 'form-control w-100';
				errorContainer.textContent = '';
			} else {
				input.className = 'form-control w-100 is-invalid'
				errorContainer.textContent = i18next.t([`errors.${value}`]);
			}
		}
	});
};
