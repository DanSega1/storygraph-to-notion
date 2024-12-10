# 📚 StoryGraph Scraper API

This is a super low-fidelity API that web-scrapes your public StoryGraph profile and gives you some serverless endpoints via Netlify Functions. You can one-click deploy to Netlify here:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/xdesro/storygraph-api)

## 🎉 Getting Started

Because there is no authentication step, this repo requires that you have a public StoryGraph profile, so the `https://app.thestorygraph.com/profile/${YOUR_USERNAME}` route it scrapes is available without being logged in.

You can set your profile to public at `https://app.thestorygraph.com/profile/edit/${YOUR_USERNAME}`.

When you deploy to Netlify (or to wherever you want to make this work), you'll need to set an `.env` variable `USERNAME` to your StoryGraph username.

## 🚏 Endpoints 

### `getList`
All of these other endpoints are just renamed calls to this one. This endpoint takes up to three arguments as query strings, `target`, `username`, and `limit`. 
- `target`: **Required.** Can be one of "books-read", "currently-reading", or "to-read".
- `username`: **Optional.** Optional because the function will try to set `username` automatically from your `process.env.USERNAME`. You can override it in the URL!
- `limit`: **Optional.** Specifies the number of books to return. By default, it gets set to `Infinity`, but for large profiles this can timeout before the 30s time limit Netlify Functions has.

_Example usage:_
```
https://yourdeployedurl.com/.netlify/functions/getList?target=to-read&username=404boyfriend&limit=5
```

### `booksRead`, `currentlyReading`, and `toRead`
Returns as many books as possible from your read, currently reading, and to-read lists. These take two optional arguments as query strings, `username` and `limit`, which work the same as for `getList`.

_Example usage:_
```
https://yourdeployedurl.com//.netlify/functions/toRead?limit=2
```

### `profile`
Returns an object `{recentReading, currentlyReading, toRead}` with as many books as it finds in each list. Takes an option argument `username`, which functions the same as previous endpoints.

> [!WARNING]
> For large profiles, this straight up will just fail. It requires making requests to all three endpoints, which then requires making multiple requests to each endpoint to paginate through the results. If all of these requests aren't completed in 30s total, the call will fail. You’re probably better off making your own individual calls to each list endpoint, so each one can take 30s.

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

WIP lol. I use [Netlify CLI](https://github.com/netlify/cli) and Postman calls to `http://localhost:8888/.netlify/functions/${endpoint}` to test the functions locally. Your mileage may vary!