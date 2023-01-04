export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');

  const parseError = dom.querySelector('parsererror');

  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    error.data = data;
    throw error;
  }

  const channelTitle = dom.querySelector('channel > title').textContent;
  const channelDescription = dom.querySelector('channel > description').textContent;

  const itemElements = dom.querySelectorAll('item');

  const items = [...itemElements].map((el) => {
    const title = el.querySelector('title').textContent;
    const link = el.querySelector('link').textContent;
    const description = el.querySelector('description').textContent;
    return { title, link, description };
  });
  return { title: channelTitle, description: channelDescription, items };
};
