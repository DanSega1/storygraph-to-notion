import "dotenv/config";

const USERNAME = process.env.USERNAME;

export const handler = async (req) => {
  const username = req.queryStringParameters?.username || USERNAME;

  try {
    const responseCurrentlyReading = await fetch(
      `${process.env.URL}/.netlify/functions/getList?target=to-read&username=${username}`,
      { signal: AbortSignal.timeout(26000) }
    );

    const currentlyReading = await responseCurrentlyReading.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentlyReading),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
