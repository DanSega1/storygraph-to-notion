import "dotenv/config";

const USERNAME = process.env.USERNAME;

export const handler = async (req) => {
  const username = req.queryStringParameters?.username || USERNAME;
  const limit = req.queryStringParameters?.limit;

  try {
    const responseBooksRead = await fetch(
      `${process.env.URL}/.netlify/functions/getList?target=books-read&username=${username}${limit ? `&limit=${limit}` : ``}`,
      { signal: AbortSignal.timeout(26000) }
    );

    const booksRead = await responseBooksRead.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booksRead),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
