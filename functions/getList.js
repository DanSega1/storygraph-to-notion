import "dotenv/config";

import { Window } from "happy-dom";
import parseBookPane from "../utils/parseBookPane.js";

const USERNAME = process.env.USERNAME;

/**
 * Create a URL for fetching data from StoryGraph.
 * @param {"books-read" | "currently-reading" | "to-read"} target - The target endpoint
 * @param {string} username - The username for the StoryGraph profile.
 * @param {number} [page=1] - Page number for pagination (SG only loads ten at a time).
 * @returns {string} The constructed URL.
 */
const createStorygraphUrl = (target, username, page = 1) =>
  `https://app.thestorygraph.com/${target}/${username}?page=${page}`;

/**
 * Fetch the HTML content of a page.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<string>} A promise resolving to the HTML string.
 */
const fetchPageHtml = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${url}, Status: ${response.status}`);
  }
  return await response.text();
};

/**
 * Collect book panes from the HTML string.
 * @param {string} htmlString - The raw HTML string of the page.
 * @returns {HTMLElement[]} An array of book pane elements.
 */
const collectBookPanesFromHtmlString = (htmlString) => {
  const window = new Window();
  const { document } = window;
  document.documentElement.innerHTML = htmlString;
  return [...document.querySelectorAll(".book-pane")];
};

/**
 * Fetch and parse all book panes across multiple pages.
 * @param {"books-read" | "currently-reading" | "to-read"} target - The target endpoint
 * @param {string} username - The username for the StoryGraph profile.
 * @returns {Promise<HTMLElement[]>} A promise resolving to an array of book pane elements.
 */
const fetchAllBookPanes = async (target, username, limit = Infinity) => {
  let page = 1;
  let hasMorePages = true;
  const allBookPanes = [];

  while (hasMorePages) {
    const url = createStorygraphUrl(target, username, page);
    const htmlString = await fetchPageHtml(url);
    const bookPanes = collectBookPanesFromHtmlString(htmlString);

    for (let i = 0; i <= limit - 1 && i <= bookPanes.length; i++) {
      allBookPanes.push(bookPanes[i]);
    }
    hasMorePages = bookPanes.length >= 10; // Stop when fewer than 10 panes are found
    page++;
    if (page >= 5 || bookPanes.length >= limit) {
      hasMorePages = false; // Prevent timeout, prevent collection after limit.
    }
  }

  return allBookPanes.filter((pane) => pane != null);
};

export const handler = async (req) => {
  const target = req.queryStringParameters?.target || "books-read";
  const username = req.queryStringParameters?.username || USERNAME;
  const limit = req.queryStringParameters?.limit || Infinity;

  try {
    const bookPanes = await fetchAllBookPanes(target, username, limit);
    const data = bookPanes.map((pane) => parseBookPane(pane));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
