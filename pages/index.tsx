import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Button, Checkbox, Form, Input } from 'antd';
import { useContractWrite, usePrepareContractWrite, useProvider } from 'wagmi'
import Swap from '../components/SwapComponent'
import dynamic from 'next/dynamic'

import { useEffect, useState } from 'react'
const SwapWidget = dynamic(
  async () => {
    const res = await import('@uniswap/widgets');
    return res.SwapWidget;
  },
  { ssr: false }
)
// import '@uniswap/widgets/dist/fonts.css'
import '@uniswap/widgets/fonts.css'



const { Search } = Input;

const Home: NextPage = () => {

  const provider = useProvider();

  const [result, setResult] = useState();


  const searchFn = async (q) => {
    try {
      const response = await fetch("/api/getAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      console.log(error.message);
    }
  }

  const onSearch = (value: string) =>{
    searchFn(value)

  } ;



  useEffect(() => {
    if (result) {
      console.log(result,'result')
    }
  }, [result])

 

  return (
    <div className={styles.container}>
      <Head>
        <title>GPT Click</title>
        <meta
          content="Natural language generates interactive buttons"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        
        <Search placeholder="请输入你想要执行的操作" onSearch={onSearch} style={{ width: 400,margin:'100px 0' }} />
        {/* <Search /> */}
        {/* <Swap /> */}

        {result && <SwapWidget 
        // provider={provider}
        width={500} 
          hideConnectionUI={true}
          defaultInputTokenAddress={result?.defaultInputTokenAddress}
          defaultOutputTokenAddress={result?.defaultOutputTokenAddress}
          defaultInputAmount={result?.defaultInputAmount}
         brandedFooter={false} />}

      </main>


    </div>
  );
};

export default Home;


