import onChange from "on-change";

export const createState = (i18next, elements, initState) => {
	const handleInputFeedback = (state) => {
		if (state.inputFeedback === null) {
			elements.inputFeedback.textContent = '';
			elements.inputFeedback.classList.remove("text-success");
			elements.inputFeedback.classList.remove("text-danger");
			elements.input.classList.remove("is-invalid");
		} else if (state.inputFeedback === "success") {
			elements.input.value = '';
			elements.input.focus();
			elements.inputFeedback.classList.add("text-success");
			elements.inputFeedback.textContent = i18next.t(`successLoad`);
		} else {
			elements.input.classList.add("is-invalid");
			elements.inputFeedback.classList.add("text-danger");
			elements.inputFeedback.textContent = i18next.t(`errors.${state.inputFeedback}`);
		}
	}

	const handleRssLoading = (state) => {
		if (state.isRssLoading) {
			elements.submitButton.setAttribute('disabled', 'true');
			elements.input.setAttribute('readonly', true);
		} else {
			elements.submitButton.removeAttribute('disabled');
			elements.input.removeAttribute('readonly');
		}
	}

	const handleFeeds = (state) => {
		const { feeds } = elements;

		const feedsTitle = document.createElement('h2');
		feedsTitle.classList.add('card-title', 'h4');
		feedsTitle.textContent = i18next.t('feeds');

		const feedsList = document.createElement('ul');
		feedsList.classList.add('list-group', 'border-0', 'rounded-0');

		const feedsListItems = state.feeds.map((feed) => {
			const element = document.createElement('li');
			element.classList.add('list-group-item', 'border-0', 'border-end-0');
			const title = document.createElement('h3');
			title.classList.add('h6', 'm-0');
			title.textContent = feed.title;
			const description = document.createElement('p');
			description.classList.add('m-0', 'small', 'text-black-50');
			description.textContent = feed.description;
			element.append(title, description);
			return element;
		});

		feedsList.append(...feedsListItems);
		feeds.innerHTML = `<div class='card-body'></div>`;
		feeds.querySelector('.card-body').appendChild(feedsTitle);
		feeds.appendChild(feedsList);
	}

	const handlePosts = (state) => {
		const { posts } = elements;

		const postsTitle = document.createElement('h2');
		postsTitle.classList.add('card-title', 'h4');
		postsTitle.textContent = i18next.t('posts');

		const postsList = document.createElement('ul');
		postsList.classList.add('list-group', 'border-0', 'rounded-0');

		const postsListItems = state.posts.map((post) => {
			const element = document.createElement('li');

			element.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
			const link = document.createElement('a');
			link.setAttribute('href', post.link);
			const className = state.seenPosts.has(String(post.id)) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
			link.classList.add(...className);
			link.dataset.id = post.id;
			link.textContent = post.title;
			link.setAttribute('target', '_blank');
			link.setAttribute('rel', 'noopener noreferrer');
			element.appendChild(link);

			const button = document.createElement('button');
			button.setAttribute('type', 'button');
			button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
			button.dataset.id = post.id;
			button.dataset.bsToggle = 'modal';
			button.dataset.bsTarget = '#modal';
			button.textContent = i18next.t('preview');
			element.appendChild(button);
			return element;
		});

		postsList.append(...postsListItems);
		posts.innerHTML = `<div class='card-body'></div>`;
		posts.querySelector('.card-body').appendChild(postsTitle);
		posts.appendChild(postsList);
	}

	const handleOpenedPost = (state) => {
		const post = state.posts.find(({ id }) => String(id) === state.openedPostId);
		const title = elements.modal.querySelector('.modal-title');
		const body = elements.modal.querySelector('.modal-body');
		const fullArticleBtn = elements.modal.querySelector('.full-article');

		title.textContent = post.title;
		body.textContent = post.description;
		fullArticleBtn.href = post.link;
	};

	return onChange(initState, (path) => {
		switch (path) {
			case "inputFeedback":
				handleInputFeedback(initState);
				break;
			case 'isRssLoading':
				handleRssLoading(initState)
				break;
			case 'feeds':
				handleFeeds(initState);
				break;
			case 'posts':
				handlePosts(initState)
				break;
			case 'seenPosts':
				handlePosts(initState);
				break;
			case 'openedPostId':
				handleOpenedPost(initState);
				break;
			default:
				break
		}
	});
};
