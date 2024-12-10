/**
 * Parses a book pane element and extracts book data.
 * @param {HTMLElement} bookPane - The DOM element representing a book pane.
 * @returns {{
 *   id: string,
 *   bookCoverStoryGraphUrl: string,
 *   title: string,
 *   author: string,
 *   genreTags?: string[],
 *   moodTags?: string[],
 *   pageCount?: number,
 *   firstPublished?: number,
 *   review?: number
 * }} The parsed book data object.
 */
export default parseBookPane = (bookPane) => {
    if (bookPane === undefined) return;
  const data = {};

  data.id = bookPane.dataset?.bookId;

  data.bookCoverStoryGraphUrl = bookPane.querySelector(".book-cover img").src;
  data.title = bookPane.querySelector(
    '.book-title-author-and-series a[href^="/books/"]'
  ).textContent;
  
  const author = bookPane.querySelector(
    '.book-title-author-and-series a[href^="/authors/"]'
  )?.textContent;
  if (author) {
    data.author = author;
  }

  // genreTags and moodTags uses a Set to deduplicate repeated tags.
  const genreTags = [
    ...new Set(
      [
        ...bookPane.querySelectorAll(
          ".book-pane-tag-section span.text-teal-700"
        ),
      ].map((tag) => tag.textContent)
    ),
  ];
  if (genreTags.length > 0) {
    data.genreTags = genreTags;
  }

  const moodTags = [
    ...new Set(
      [
        ...bookPane.querySelectorAll(
          ".book-pane-tag-section span.text-pink-500"
        ),
      ].map((tag) => tag.textContent)
    ),
  ];
  if (moodTags.length > 0) {
    data.moodTags = moodTags;
  }

  const pageCount = [...bookPane.querySelectorAll("p")].find((tag) =>
    tag.textContent.trim().toLowerCase().includes("pages")
  )?.textContent;
  if (pageCount) {
    data.pageCount = parseInt(pageCount);
  }

  const firstPublished = [...bookPane.querySelectorAll("span")].find((tag) =>
    tag.textContent.trim().toLowerCase().includes("first pub")
  )?.textContent;
  if (firstPublished) {
    data.firstPublished = parseInt(firstPublished.match(/(\d+)$/)[0]);
  }

  const review = bookPane.querySelector('a[href^="/reviews/"]')
    ?.previousElementSibling?.textContent;
  if (review) {
    data.review = parseFloat(review);
  }

  return data;
};
