import { NextRequest, NextResponse } from "next/server";
import {
  WebBrowser
} from "langchain/tools/webbrowser";
import {
  ChatOpenAI
} from "langchain/chat_models/openai";
import {
  OpenAIEmbeddings
} from "langchain/embeddings/openai";




// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextRequest, res: NextResponse) {
  console.log(process.env.OPENAI_API_KEY, ' process.env.OPENAI_API_KEY')
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: {
        message: "apiKey has error",
      }
    });
    return;
  }

  const { q, url } = req.body;
  if (q.trim().length === 0 || url.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter question or URL",
      }
    });
    return;
  }


  try {

    const model = new ChatOpenAI({
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY

    });

    const browser = new WebBrowser({
      model,
      embeddings
    });
    console.log('start')

    const result = await browser.call(
      `${url},${q}`
    );

    console.log(result);

    return res.status(200).json({ result });


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

