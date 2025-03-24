import { Client } from '@notionhq/client';
import { scrapeStoryGraphList } from './scrapeStoryGraph.js';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const username = process.env.USERNAME;

/**
 * Adds or updates a book in the Notion database
 * 
 * @param {Object} book - The book object from StoryGraph
 * @param {string} listType - One of "books-read", "currently-reading", or "to-read"
 */
async function addBookToNotion(book, listType) {
  try {
    // Check if book already exists in database
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "StoryGraph ID",
        rich_text: {
          equals: book.id
        }
      }
    });

    const bookProperties = {
      "Title": {
        title: [
          {
            text: {
              content: book.title
            }
          }
        ]
      },
      "Author": {
        rich_text: [
          {
            text: {
              content: book.author || "Unknown"
            }
          }
        ]
      },
      "StoryGraph ID": {
        rich_text: [
          {
            text: {
              content: book.id
            }
          }
        ]
      },
      "Status": {
        select: {
          name: listTypeToStatus(listType)
        }
      },
      "Page Count": book.pageCount ? {
        number: book.pageCount
      } : undefined,
      "First Published": book.firstPublished ? {
        number: book.firstPublished
      } : undefined,
      "Cover Image": book.bookCoverStoryGraphUrl ? {
        url: book.bookCoverStoryGraphUrl
      } : undefined,
      "Genres": {
        multi_select: book.genreTags ? 
          book.genreTags.map(tag => ({ name: tag })).slice(0, 10) : []
      },
      "Moods": {
        multi_select: book.moodTags ? 
          book.moodTags.map(tag => ({ name: tag })).slice(0, 10) : []
      }
    };

    // Remove undefined properties
    Object.keys(bookProperties).forEach(key => 
      bookProperties[key] === undefined && delete bookProperties[key]
    );

    if (response.results.length > 0) {
      // Update existing entry
      const pageId = response.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: bookProperties
      });
      console.log(`Updated book: ${book.title}`);
    } else {
      // Create new entry
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: bookProperties
      });
      console.log(`Added new book: ${book.title}`);
    }
  } catch (error) {
    console.error(`Error adding book ${book.title} to Notion:`, error);
  }
}

/**
 * Converts StoryGraph list type to a status value for Notion
 */
function listTypeToStatus(listType) {
  switch(listType) {
    case 'books-read':
      return 'Read';
    case 'currently-reading':
      return 'Reading';
    case 'to-read':
      return 'Want to Read';
    default:
      return 'Unknown';
  }
}

/**
 * Syncs all StoryGraph lists to Notion
 */
async function syncAllToNotion() {
  try {
    console.log('Starting sync to Notion...');
    
    // Get all lists from StoryGraph
    const listTypes = ['books-read', 'currently-reading', 'to-read'];
    
    for (const listType of listTypes) {
      console.log(`Fetching ${listType} list...`);
      const books = await scrapeStoryGraphList({ target: listType, username });
      console.log(`Found ${books.length} books in ${listType}`);
      
      // Add/update each book in Notion
      for (const book of books) {
        await addBookToNotion(book, listType);
      }
    }
    
    console.log('Sync to Notion completed!');
  } catch (error) {
    console.error('Error syncing to Notion:', error);
  }
}

// Execute the sync if this file is run directly
if (import.meta.url === new URL(import.meta.url).href) {
  syncAllToNotion();
}

export { syncAllToNotion, addBookToNotion };
