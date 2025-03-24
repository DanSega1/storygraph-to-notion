# 📚 StoryGraph to Notion Sync via GitHub Actions

This project automatically syncs your StoryGraph reading data to Notion using GitHub Actions. It's a fork of [xdesro/storygraph-api](https://github.com/xdesro/storygraph-api), modified to use GitHub Actions instead of Netlify Functions and with added Notion integration.

## Overview

This integration:
- Scrapes your public StoryGraph profile daily
- Updates your Notion database with your reading data
- Deploys an API that can be queried for your reading data

## 🎉 Setting Up

### Prerequisites
- A public StoryGraph profile (set at `https://app.thestorygraph.com/profile/edit/${YOUR_USERNAME}`)
- A GitHub account
- A Notion account

### Setting up Notion Integration

1. Create a Notion integration:
   - Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Create a new integration and copy the API key

2. Create a database in Notion with the required properties:
   - You can use [this template](https://wheat-adasaurus-547.notion.site/1c0c431d2a0880c98551c4ca670ab63d?v=1c0c431d2a08810ca897000ce98ab5cd&pvs=4) as a starting point
   - Or create your own with these properties:
     - Title (title)
     - Author (rich text)
     - StoryGraph ID (rich text)
     - Status (select with options: Read, Reading, Want to Read)
     - Page Count (number)
     - First Published (number)
     - Cover Image (url)
     - Genres (multi-select)
     - Moods (multi-select)

3. Share your database with the integration:
   - Open your Notion database
   - Click the "..." menu in the top right corner
   - Select "Add connections" and add your integration

4. Get your database ID:
   - The database ID is the part of your database URL that comes after notion.so/ and before the first ? or #
   - Example: For the URL `https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...`, the ID is `a8aec43384f447ed84390e8e42c2e089`
   - You can also use the [Notion API](https://developers.notion.com/reference/retrieve-a-database) to retrieve the database ID

5. Add GitHub repository secrets:
   - `NOTION_API_KEY`: Your Notion integration API key
   - `NOTION_DATABASE_ID`: Your Notion database ID
   - `USERNAME`: Your StoryGraph username

### GitHub Actions Setup

The workflow automatically:
1. Runs daily at 9:00 AM UTC
2. Runs on every push to the main branch
3. Fetches your StoryGraph data
4. Updates your Notion database
5. Deploys an API endpoint

You can configure the workflow in `.github/workflows/main.yml`.

## Data Flow

```
StoryGraph Profile → GitHub Actions → Notion Database
                    ↓
                  API Endpoints
```

## 🚏 API Endpoints 

If you need direct access to your StoryGraph data, you can use these API endpoints:

### `getList`
Takes parameters: `target` (required), `username`, `limit`
- `target`: One of "books-read", "currently-reading", or "to-read"
- `username`: Overrides the default username
- `limit`: Number of books to return

Example: `https://yourdeployedurl.com/api/getList?target=to-read&username=yourusername&limit=5`

### `booksRead`, `currentlyReading`, and `toRead`
Takes parameters: `username`, `limit`

Example: `https://yourdeployedurl.com/api/toRead?limit=2`

### `profile`
Returns data from all lists. Takes parameter: `username`


## 📕 Example Book Data

```json
{
  "id": "f3158a48-cb26-4887-a8df-9b8cae6cc377",
  "bookCoverStoryGraphUrl": "https://cdn.thestorygraph.com/z1l5ydkwerochy5ldh0w07ysm24h",
  "title": "Zen and the Art of Motorcycle Maintenance: An Inquiry Into Values",
  "author": "Robert M. Pirsig",
  "genreTags": ["fiction", "classics", "philosophy"],
  "moodTags": ["challenging", "informative", "reflective", "slow-paced"],
  "pageCount": 540,
  "firstPublished": 1974
}
```

## 🚧 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test Notion integration
node utils/syncToNotion.js
```

## Environment Variables

For both GitHub Actions and local development:
- `USERNAME`: Your StoryGraph username
- `NOTION_API_KEY`: Your Notion integration API key
- `NOTION_DATABASE_ID`: Your Notion database ID

These are configured as GitHub repository secrets:
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret" to add these variables