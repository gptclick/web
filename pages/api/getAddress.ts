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
          "content": "The rule of the game is to provide a JSON output based on the given input, following the rules belowr: If the paragraph contains words like 'exchange' or 'swap', return [{tokenA:xx, tokenB:xx, chain:xx, amount:xx, action:'swap'}]. If the paragraph contains words related to minting, return [{action:'mint', time:xx, chain:xx}]. If neither of the above conditions is met, return [{action:'error'}]. If the input is in a language other than English, it should be translated to English before applying the rules to generate the JSON output."
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

    console.log(content, 'content')

    try {
      content = await JSON.parse(content)
      console.log(content, 'content')

    } catch (error) {
      res.status(400).json({
        error
      })
    }

    await fetch('https://gateway.ipfs.io/ipns/tokens.uniswap.org')
      .then(res => res.json())
      .then(async res => {
        if (content?.[0]?.action == 'swap') {
          const { amount, chain, tokenA, tokenB, } = content?.[0]

          const tokens= res.tokens

          const findTokenA = await tokens.filter(i => tokenA.toUpperCase() == i.symbol)
          const findTokenB = await tokens.filter(i => tokenB.toUpperCase() == i.symbol)
          result = {
            defaultInputTokenAddress: findTokenA?.[0]?.address,
            defaultInputAmount: amount,
            defaultOutputTokenAddress: findTokenB?.[0]?.address,
            chain: '',
            chainId: '',
          }
          console.log(result, 'dd')

          return res.status(200).json({ result });

        }

        return res.status(200).json({ result: {} });

      })
      .catch(e => {

        res.status(200).json({ result: {} });

      })
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

