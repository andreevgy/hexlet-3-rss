import './app.scss';
import 'bootstrap';
import {string, setLocale} from "yup";
import {createState} from "./state";
import i18next from "i18next";
import locale from "./locales/yupLocale";
import ru from "./locales/ru";
import axios from 'axios';
import parse from './rssParser';

let numericId = 0;

const generateNewId = () => {
	return numericId++;
}

const getLoadingError = (e) => {
	if (e.isParsingError) {
		return 'noRss';
	}
	if (e.isAxiosError) {
		return 'network';
	}
	return 'unknown';
};

const addProxy = (url) => {
	const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
	urlWithProxy.searchParams.set('url', url);
	urlWithProxy.searchParams.set('disableCache', 'true');
	return urlWithProxy.toString();
};

const loadRss = (state, url) => {
	state.isRssLoading = true;
	return axios.get(addProxy(url), { timeout: 10000 })
		.then((response) => {
			const data = parse(response.data.contents);
			const feed = {
				url, title: data.title, description: data.description, id: generateNewId(),
			};
			const posts = data.items.map((item) => ({ ...item, channelId: feed.id, id: generateNewId(), }));
			state.posts.unshift(...posts);
			state.feeds.unshift(feed);

			state.rssLoadingError = null;
			state.inputFeedback = 'success';
		})
		.catch((e) => {
			state.rssLoadingError = getLoadingError(e);
		})
		.finally(() => {
			state.isRssLoading = false;
		});
};

const app = () => {
	const elements = {
		form: document.querySelector("form"),
		input: document.querySelector("#url-input"),
		inputFeedback: document.querySelector("#input-feedback-container"),
		submitButton: document.querySelector("#submit-button"),
		feeds: document.querySelector('.feeds'),
		posts: document.querySelector('.posts'),
	}

	const initialState = {
		inputFeedback: null,
		rssLoadingError: null,
		isRssLoading: false,
		posts: [],
		feeds: [],
	}

	const i18nextInstance = i18next.createInstance();

	i18nextInstance.init({
		lng: 'ru',
		debug: false,
		resources: {ru},
	}).then(() => {
		setLocale(locale);
		const urlValidator = string().url().required();

		const state = createState(i18nextInstance, elements, initialState);

		const validateUrl = (url, urlsList) => {
			const urlSchema = urlValidator.notOneOf(urlsList);
			return urlSchema.validate(url);
		}

		elements.form.addEventListener("submit", (event) => {
			event.preventDefault();
			const data = new FormData(event.target);
			const url = data.get("url");
			validateUrl(url, state.feeds.map(f => f.url))
				.then(() => {
					state.inputFeedback = null;
					loadRss(state, url);
				})
				.catch((err) => {
					console.log(err);
					state.inputFeedback = err.message.key;
				});
		});
	});
}

app();
