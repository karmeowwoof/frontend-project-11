/* eslint-disable no-param-reassign */
const handleProcessState = (elements, i18nextInstance, processState) => {
  switch (processState) {
    case 'filling':
      elements.submit.disabled = false;
      break;
    case 'sending':
      elements.submit.disabled = true;
      elements.feedback.textContent = '';
      break;
    case 'added':
      elements.submit.disabled = false;
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.input.classList.remove('is-invalid');
      elements.feedback.textContent = '';
      elements.feedback.textContent = i18nextInstance.t('success.rss');
      elements.form.reset();
      elements.input.focus();
      break;
    case 'error':
      elements.submit.disabled = false;
      elements.input.focus();
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};
const renderErrors = (elements, i18nextInstance, errorValue) => {
  if (errorValue === '') {
    return;
  }
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = '';
  elements.feedback.textContent = i18nextInstance.t(`errors.${errorValue}`);
};
const renderFeeds = (elements, i18nextInstance, feeds) => {
  elements.feeds.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  elements.feeds.append(container);
  const div = document.createElement('div');
  div.classList.add('card-body');
  container.append(div);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('main.feeds');
  div.append(h2);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  container.append(ul);
  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    li.append(h3);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
    ul.append(li);
  });
};

const renderPosts = (state, elements, i18nextInstance, posts) => {
  elements.posts.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  elements.posts.append(container);
  const div = document.createElement('div');
  div.classList.add('card-body');
  container.append(div);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('main.posts');
  div.append(h2);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  container.append(ul);
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const a = document.createElement('a');

    if (state.visitedPostsId.has(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.setAttribute('href', post.link);
    a.setAttribute('data-id', post.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    li.append(a);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstance.t('main.openModal');
    li.append(button);
    ul.append(li);
  });
};
const renderVisitedPosts = (visitedPostsId) => {
  visitedPostsId.forEach((id) => {
    const a = document.querySelector(`a[data-id="${id}"]`);
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
  });
};
const renderCurrentModal = (state, elements, currentPostId) => {
  const currentPost = state.posts.find((post) => post.id === currentPostId);
  elements.modalTitle.textContent = currentPost.title;
  elements.modalBody.textContent = currentPost.description;
};

const render = (state, elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, i18nextInstance, value);
      break;
    case 'form.errors':
      renderErrors(elements, i18nextInstance, value);
      break;
    case 'feeds':
      renderFeeds(elements, i18nextInstance, value);
      break;

    case 'posts':
      renderPosts(state, elements, i18nextInstance, value);
      break;

    case 'visitedPostsId':
      renderVisitedPosts(value);
      break;

    case 'currentPostId':
      renderCurrentModal(state, elements, value);
      break;

    default:
      break;
  }
};
export default render;
