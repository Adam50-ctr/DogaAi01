console.log(">> Ez a GPT.js ténylegesen fut! Modell: 3.5");
require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { fullText } = JSON.parse(event.body);
    console.log("Kapott szöveg:", fullText);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Ez a tananyag: ${fullText}\n\nÍrd ki a 5 legvalószínűbb dolgozati kérdést tanári stílusban, pontokba szedve.`,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenAI válasz:", data);

    if (!data.choices || !data.choices[0]) {
      throw new Error("A válasz nem tartalmazott 'choices'-t.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result: data.choices[0].message.content }),
    };
  } catch (err) {
    console.error("Hiba:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ result: "Hiba történt: " + err.message }),
    };
  }
};
