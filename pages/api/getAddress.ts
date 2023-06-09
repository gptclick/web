import { Configuration, OpenAIApi } from "openai";
import { NextRequest, NextResponse } from "next/server";
import TOKENS from '../../abi/tokens.json'


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
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "The rule of the game is to provide a JSON output based on the given input, following the rules belowr: If the paragraph contains words like 'exchange' or 'swap', return [{tokenA:xx, tokenB:xx, chain:xx, amount:xx, action:'swap'}]. If the paragraph contains words related to minting, return [{action:'mint', time:xx, chain:xx}].The default chain is Ethereum, the default quantity is 1, If neither of the above conditions is met, return [{action:'error'}]. If the input is in a language other than English, it should be translated to English before applying the rules to generate the JSON output.Only return the JSON code as answer, do NOT include any extra text,"
        },
        {
          "role": "user",
          "content": `${q}`
        }
      ],
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stream": false,
      "max_tokens": 250,
      "presence_penalty": 0,
      "frequency_penalty": 0
    });


    // todo 执行串联的多步操作
    let content = completion.data.choices[0].message?.content
    let result: any


    try {

      content = JSON.parse(content)

    } catch (error) {
      console.log(error,'err')
      res.status(400).json({
        error
      })
    }

    
    if (content?.[0]?.action == 'swap') {
      const { amount, chain, tokenA, tokenB, } = content?.[0]

      
      const tokens = TOKENS.tokens

      const findTokenA = await tokens.filter(i => tokenA.toUpperCase() == i.symbol)
      const findTokenB = await tokens.filter(i => tokenB.toUpperCase() == i.symbol)

      return res.status(200).json({
        result: {
          defaultInputTokenAddress: findTokenA?.[0]?.address,
          defaultInputAmount: amount,
          defaultOutputTokenAddress: findTokenB?.[0]?.address,
          chain: chain,
          chainId: '',
        }
      });

    }

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

