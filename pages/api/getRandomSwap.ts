import { Configuration, OpenAIApi } from "openai";
import { NextRequest, NextResponse } from "next/server";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextRequest, res: NextResponse) {
  console.log(process.env.OPENAI_API_KEY, ' process.env.OPENAI_API_KEY')
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "has error",
      }
    });
    return;
  }


  try {
    const completion = await openai.createChatCompletion({
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "'2个eth换link'，'1.5个link换uni'，'bnb换matic'，'weth换usdt',请给出几个类似的swap场景,请注意没有btc，只返回string OUTPUT:"
        }
      ],
      "temperature": 0,
      "top_p": 0.1,
      "n": 1,
      "stream": false,
      "max_tokens": 250,
      "presence_penalty": 0,
      "frequency_penalty": 0
    });


    let content = completion.data.choices[0].message?.content
    return res.status(200).json({ result: content?.split('，')?.map(item=>item.slice(1,-1)) });

    
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

