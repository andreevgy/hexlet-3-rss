import './app.scss';
import 'bootstrap';
import { string} from "yup";
import { createState } from "./state";

const prepareForm = (form, input) => {
	form.reset();
	input.focus();
	input.className = 'form-control w-100';
}

const urlValidator = string().url();

const app = () => {
	const form = document.querySelector("form");
	const input = document.querySelector("#url-input");

	prepareForm(form, input);

	const state = createState();

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const data = new FormData(event.target);
		const url = data.get("url");
		urlValidator.validate(url)
			.then(() => {
				if (state.rssList.includes(url)) {
					state.inputError = "This url is already added";
					return;
				}
				state.rssList.push(url);
				state.inputError = null;
				prepareForm(form, input);
			})
			.catch(() => {
				state.inputError = "URL is not valid";
			});
	});

}

app();
