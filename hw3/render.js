import { list, newPost, show } from './layout.js';

const apiUrl = 'http://localhost:3000';

async function initialize() {
  try {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment);

    if (segments.length === 0) {
      await loadPosts();
    } else if (segments[0] === 'post') {
      if (segments[1] === 'new') {
        render(newPost());
      } else {
        await loadPostDetail(segments[1]);
      }
    }
  } catch (error) {
    console.error('Initialization error:', error);
    document.body.innerHTML = `<h1>Error loading page</h1><p>${error.message}</p>`;
  }
}

async function loadPosts() {
  try {
    const response = await fetch(`${apiUrl}/posts`);
    const posts = await response.json();
    render(list(posts));
  } catch (error) {
    console.error('Error loading posts:', error);
    document.body.innerHTML = `<h1>Error</h1><p>Could not load posts. Please try again later.</p>`;
  }
}

async function loadPostDetail(postId) {
  try {
    const response = await fetch(`${apiUrl}/post/${postId}`);
    const post = await response.json();
    render(show(post));
  } catch (error) {
    console.error(`Error loading post ${postId}:`, error);
    document.body.innerHTML = `<h1>Error</h1><p>Could not load the post. Please try again later.</p>`;
  }
}

function render(html) {
  document.body.innerHTML = html;
}

initialize();
