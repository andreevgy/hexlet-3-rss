import './app.scss';
import 'bootstrap';
import {string, setLocale} from "yup";
import {createState} from "./state";
import i18next from "i18next";
import locale from "./locales/yupLocale";
import ru from "./locales/ru";

const app = () => {
	const elements = {
		form: document.querySelector("form"),
		input: document.querySelector("#url-input"),
		inputError: document.querySelector("#error-container"),
	}

	const i18nextInstance = i18next.createInstance();

	i18nextInstance.init({
		lng: 'ru',
		debug: false,
		resources: {ru},
	}).then(() => {
		setLocale(locale);
		const urlValidator = string().url().required();

		const state = createState(i18nextInstance, elements);

		const validateUrl = (url, urlsList) => {
			const urlSchema = urlValidator.notOneOf(urlsList);
			return urlSchema.validate(url);
		}

		elements.form.addEventListener("submit", (event) => {
			event.preventDefault();
			const data = new FormData(event.target);
			const url = data.get("url");
			validateUrl(url, state.rssList)
				.then(() => {
					state.rssList.push(url);
					state.inputError = null;
				})
				.catch((err) => {
					state.inputError = err.message.key;
				});
		});
	});
}

app();
