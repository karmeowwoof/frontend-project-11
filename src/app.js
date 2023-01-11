import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import getParsedRSS from './rssParser.js';


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
  const input = document.querySelector('#url-input');
  const form = document.querySelector('.rss-form');
  const feedback = document.querySelector('.feedback');
  const submit = document.querySelector('button[type="submit"]');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');

  const elements = {
    input,
    form,
    feedback,
    submit,
    feeds,
    posts,
    modalTitle,
    modalBody,
  };
  const state = onChange(defaultState, render(defaultState, elements, i18nextInstance));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.form.processState = 'sending';
    const formData = new FormData(event.target);
    const inputValue = formData.get('url');
    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(state.form.urls);
    schema.validate(inputValue)
    .then(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputValue)}`))
    .then((response) => getParsedRSS(response.data.contents))
    .then((parsedContent) => {
      state.form.urls.unshift(inputValue);
      state.feeds.unshift(parsedContent.feed);
      state.posts = parsedContent.posts.concat(state.posts);
      state.form.errors = '';
      state.form.processState = 'added';
      render(state, elements, i18nextInstance);
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

  const goToArticleButton = document.querySelector('.full-article');
  goToArticleButton.addEventListener('click', (event) => {
    event.preventDefault()
    const currentPost = state.posts.find((post) => post.id === state.currentPostId);
    if(currentPost && currentPost.link) window.open(currentPost.link, '_blank');
  });
  
  
 
  const updateRssPosts = () => {
    state.form.urls.forEach((url) => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((updatedResponse) => getParsedRSS(updatedResponse.data.contents))
      .then((updatedParsedContent) => {
          const newPosts = updatedParsedContent.posts.filter((post) => !state.visitedPostsId.has(post.id));
          if (newPosts.length > 0) {
            state.posts = newPosts.concat(state.posts);
            render(state, elements, i18nextInstance);
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
      setTimeout(updateRssPosts, 10000);
    };
  }


export default runApp;