import 'dotenv/config'

const USERNAME = process.env.USERNAME;

export const handler = async (req) => {
    const username = req.queryStringParameters?.username || USERNAME;

  try {
      const responseCurrentlyReading = await fetch(
          `${process.env.URL}/.netlify/functions/getList?target=currently-reading&username=${username}`
        );
        const responseToRead = await fetch(
            `${process.env.URL}/.netlify/functions/getList?target=to-read&username=${username}`
        );
        const responseBooksRead = await fetch(
          `${process.env.URL}/.netlify/functions/getList?target=books-read&username=${username}`
        ,{ signal: AbortSignal.timeout(26000) });
    const recentReading = await responseBooksRead.json();
    const currentlyReading = await responseCurrentlyReading.json();
    const toRead = await responseToRead.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recentReading, currentlyReading, toRead }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
