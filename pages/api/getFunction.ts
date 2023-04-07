import { Configuration, OpenAIApi } from "openai";
import { NextRequest, NextResponse } from "next/server";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextRequest, res: NextResponse) {
  console.log(process.env.OPENAI_API_KEY,' process.env.OPENAI_API_KEY')
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "has error",
      }
    });
    return;
  }

  const q = req.body.q || '';
  if (q.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter",
      }
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: generatePrompt(q),
      temperature: 0.6,
    });
    console.log(completion,'completion')
    res.status(200).json({ result: completion.data.choices[0].message });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(q) {
  const oriText='把以下内容翻译为英语'
  const result =
    [
      {
        "role": "system",
        "content": oriText
      },
      {
        "role": "user",
        "content": q
      }
    ]

  console.log(result.toString(), result,'result')
  return `${result}`;
}