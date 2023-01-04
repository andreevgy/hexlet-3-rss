import './app.scss';
import 'bootstrap';
import { string, setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import createState from './state';
import locale from './locales/yupLocale';
import ru from './locales/ru';
import parse from './rssParser';

const fetchingTimeout = 5000;

let numericId = 0;

const generateNewId = () => {
  numericId += 1;
  return numericId;
};

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
      const posts = data.items.map((item) => ({ ...item, feedId: feed.id, id: generateNewId() }));
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

const fetchNewPosts = (state) => {
  const promises = state.feeds.map((feed) => {
    const urlWithProxy = addProxy(feed.url);
    return axios.get(urlWithProxy)
      .then((response) => {
        const feedData = parse(response.data.contents);
        const newPosts = feedData.items.map((item) => ({ ...item, feedId: feed.id }));
        const oldPosts = state.posts.filter((post) => post.feedId === feed.id);
        const missingPosts = newPosts
          .filter((newPost) => !oldPosts.find((oldPost) => oldPost.title === newPost.title))
          .map((p) => ({ ...p, id: generateNewId() }));
        state.posts.unshift(...missingPosts);
      })
      .catch((e) => {
        console.error(e);
      });
  });
  Promise.all(promises).finally(() => {
    setTimeout(() => fetchNewPosts(state), fetchingTimeout);
  });
};

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    inputFeedback: document.querySelector('#input-feedback-container'),
    submitButton: document.querySelector('#submit-button'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const initialState = {
    inputFeedback: null,
    rssLoadingError: null,
    isRssLoading: false,
    posts: [],
    feeds: [],
    openedPostId: null,
    seenPosts: new Set(),
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  }).then(() => {
    setLocale(locale);
    const urlValidator = string().url().required();

    const state = createState(i18nextInstance, elements, initialState);

    const validateUrl = (url, urlsList) => {
      const urlSchema = urlValidator.notOneOf(urlsList);
      return urlSchema.validate(url);
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const url = data.get('url');
      validateUrl(url, state.feeds.map((f) => f.url))
        .then(() => {
          state.inputFeedback = null;
          loadRss(state, url);
        })
        .catch((err) => {
          state.inputFeedback = err.message.key;
        });
    });

    elements.posts.addEventListener('click', (evt) => {
      if (!('id' in evt.target.dataset)) {
        return;
      }

      const { id } = evt.target.dataset;
      state.openedPostId = id;
      state.seenPosts.add(id);
    });

    setTimeout(() => fetchNewPosts(state), fetchingTimeout);
  });
};

app();
