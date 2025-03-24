# 📚 StoryGraph Scraper API

This is a super low-fidelity API that web-scrapes your public StoryGraph profile and gives you some serverless endpoints via GitHub Actions. This repository is a fork of [xdesro/storygraph-api](https://github.com/xdesro/storygraph-api), modified to use GitHub Actions instead of Netlify Functions for deployment.

## 🎉 Getting Started

Because there is no authentication step, this repo requires that you have a public StoryGraph profile, so the `https://app.thestorygraph.com/profile/${YOUR_USERNAME}` route it scrapes is available without being logged in.

You can set your profile to public at `https://app.thestorygraph.com/profile/edit/${YOUR_USERNAME}`.

When you deploy using GitHub Actions, you'll need to set a repository secret named `USERNAME` to your StoryGraph username.

## 🚏 Endpoints 

### `getList`
All of these other endpoints are just renamed calls to this one. This endpoint takes up to three arguments as query strings, `target`, `username`, and `limit`. 
- `target`: **Required.** Can be one of "books-read", "currently-reading", or "to-read".
- `username`: **Optional.** Optional because the function will try to set `username` automatically from your environment variable `USERNAME`. You can override it in the URL!
- `limit`: **Optional.** Specifies the number of books to return. By default, it gets set to `Infinity`, but for large profiles this can timeout before the function execution time limit.

_Example usage:_
```
https://yourdeployedurl.com/api/getList?target=to-read&username=404boyfriend&limit=5
```

### `booksRead`, `currentlyReading`, and `toRead`
Returns as many books as possible from your read, currently reading, and to-read lists. These take two optional arguments as query strings, `username` and `limit`, which work the same as for `getList`.

_Example usage:_
```
https://yourdeployedurl.com/api/toRead?limit=2
```

### `profile`
Returns an object `{recentReading, currentlyReading, toRead}` with as many books as it finds in each list. Takes an option argument `username`, which functions the same as previous endpoints.

> [!WARNING]
> For large profiles, this straight up will just fail. It requires making requests to all three endpoints, which then requires making multiple requests to each endpoint to paginate through the results. If all of these requests aren't completed within the function execution time limit, the call will fail. You're probably better off making your own individual calls to each list endpoint, so each one can have its full execution time.

## 📕 Example Response

The API tries to return as much information as it can from each book, and if a field isn't found, nothing is returned.

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

More information can be found [in the JSDoc for book parsing](https://github.com/xdesro/storygraph-api/blob/main/utils/parseBookPane.js#L1C1-L15C4).

## 🚧 Local Development

To run locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Deployment

This project is automatically built and deployed using GitHub Actions.

### CI/CD Pipeline

The GitHub Actions workflow automatically:

1. Runs on every push to the main branch and on pull requests
2. Runs daily at 9:00 AM UTC to ensure data is kept up-to-date
3. Sets up Node.js environment
4. Installs dependencies
5. Builds the project
6. Deploys to GitHub Pages (only on push to main or scheduled runs)

You can see the workflow configuration in `.github/workflows/main.yml`.

### Environment Variables

Environment variables are managed through GitHub repository secrets. To add or modify environment variables:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret" to add variables needed for your build (like `USERNAME`)