/* eslint-disable */
import _ from 'lodash';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import getParsedRSS from './rssParser.js';

const buildProxiedUrl = (url) => {
  const proxiedUrl = new URL('https://allorigins.hexlet.app/get');
  proxiedUrl.searchParams.set('disableCache', 'true');
  proxiedUrl.searchParams.set('url', url);
  return proxiedUrl.toString();
};

const getDownloadedRss = (url) => axios.get(buildProxiedUrl(url));

const setIds = (posts) => posts.map((post) => {
  const post1 = post;
  post1.id = _.uniqueId();
  return post1;
});

const runApp = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });
  const defaultState = {
    form: {
      processState: 'filling',
      errors: '',
      urls: [],
    },
    feeds: [],
    posts: [],
    visitedPostsId: new Set(),
    currentPostId: '',
  };

  yup.setLocale({
    string: {
      url: 'notValidUrl',
    },
    mixed: {
      notOneOf: 'notOneOf',
    },
  });

  const elements = {
    input: document.querySelector('#url-input'),
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    goToArticleButton: document.querySelector('.full-article'),
  };

  const state = onChange(
    defaultState,
    render(defaultState, elements, i18nextInstance),
  );

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.form.processState = 'sending';
    const formData = new FormData(event.target);
    const inputValue = formData.get('url');
    const schema = yup.string().required().url().notOneOf(state.form.urls);

    schema.validate(inputValue)
      .then(() => {
        state.form.errors = '';
        state.form.processState = 'sending';
        return getDownloadedRss(inputValue);
      })
      .then((response) => {
        const parsedContent = getParsedRSS(response.data.contents);
        parsedContent.posts = setIds(parsedContent.posts);
        state.form.urls.unshift(inputValue);
        state.feeds.unshift(parsedContent.feed);
        state.posts = parsedContent.posts.concat(state.posts);
        state.form.errors = '';
        state.form.processState = 'added';
      })
      .catch((err) => {
        state.form.processState = 'error';
        if (err.name === 'AxiosError') {
          state.form.errors = 'network';
        } else {
          state.form.errors = err.message;
        }
      });
  });

  elements.posts.addEventListener('click', (event) => {
    const currentId = event.target.dataset.id;
    state.visitedPostsId.add(currentId);
    state.currentPostId = currentId;
  });

  elements.goToArticleButton.addEventListener('click', (event) => {
    event.preventDefault();
    const currentPost = state.posts.find((post) => post.id === state.currentPostId);
    if (currentPost && currentPost.link) window.open(currentPost.link, '_blank');
  });

  const updateRssPosts = () => {
    const promises = state.form.urls.map((url) => {
    state.form.urls.forEach((url) => {
      axios
        .get(buildProxiedUrl(url))
        .then((updatedResponse) => {
          const updatedParsedContent = getParsedRSS(updatedResponse.data.contents);
          const newPosts = updatedParsedContent.posts.filter(
            (post) => !state.visitedPostsId.has(post.id),
          );
          if (newPosts.length > 0) {
            state.posts = newPosts.concat(state.posts);
            setIds(newPosts);
          }
        })
        .catch((err) => {
          if (err.name === 'AxiosError') {
            state.form.errors = 'network';
          } else {
            state.form.errors = err.message;
          }
        });
    });
  });
  Promise.all(promises)
    .finally(() => setTimeout(updateRssPosts, 10000))
};

};

export default runApp;
