import './sass/main.scss';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesAPIService from './js/imageAPIservice';
import LoadMoreBtn from './js/load-more-btn';
import Markup from './js/imagemerkup';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

const imagesAPIService = new ImagesAPIService();
const loadMoreBtn = new LoadMoreBtn({ selector: '.load-more' });
const renderMarkup = new Markup({ selector: refs.gallery });

refs.form.addEventListener('submit', onFormSubmit);
loadMoreBtn.button.addEventListener('click', onloadMoreBtnClick);

// Submit handler
async function onFormSubmit(e) {
  e.preventDefault();
  renderMarkup.reset();
  imagesAPIService.query = e.currentTarget.searchQuery.value.trim();

  if (imagesAPIService.query === '') {
    loadMoreBtn.hideBtn();
    Notify.info('Your query is empty. Try again!');
    return;
  }

  imagesAPIService.resetPage();

  try {
    loadMoreBtn.showBtn();
    await initFetchImages();
  } catch (error) {
    loadMoreBtn.hideBtn();
    Notify.failure(error.message);
  }

  refs.form.reset();
}

// Load-More Button handler
async function onloadMoreBtnClick() {
  await initFetchImages();
  pageScroll();
  renderMarkup.lightbox.refresh();
}

// Send request
async function initFetchImages() {
  loadMoreBtn.disable();
  const images = await imagesAPIService.fetchImages();
  renderMarkup.items = images;
  renderMarkup.render();

  if (imagesAPIService.endOfHits) {
    loadMoreBtn.hideBtn();
    return;
  }
  loadMoreBtn.enable();
}

// Scroll page
function pageScroll() {
  const { height: formHeight } = refs.form.getBoundingClientRect();
  const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2 - formHeight * 2,
    behavior: 'smooth',
  });
}