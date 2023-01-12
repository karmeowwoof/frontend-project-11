import _ from 'lodash';

const getParsedRSS = (content) => {
  const parser = new DOMParser();
  const parsedContent = parser.parseFromString(content, 'application/xml');

  if (parsedContent.querySelector('parsererror')) {
    throw new Error('notValidRss');
  }

  const feed = {
    title: parsedContent.querySelector('title').textContent,
    description: parsedContent.querySelector('description').textContent,
  };

  const items = parsedContent.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const itemTitleEl = item.querySelector('title');
    const itemDescriptionEl = item.querySelector('description');
    const itemLinkEl = item.querySelector('link');

    return {
      title: itemTitleEl.textContent,
      description: itemDescriptionEl.textContent,
      link: itemLinkEl.textContent,
      id: _.uniqueId(),
    };
  });

  return { feed, posts };
};
export default getParsedRSS;
