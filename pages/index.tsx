import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Tag, Divider, Space, Input, Skeleton } from 'antd';
// import Swap from '../components/SwapComponent'
import {
  SyncOutlined,
} from '@ant-design/icons';
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

  const [result, setResult] = useState();
  const [randomSwapList, setRandomSwapList] = useState([]);
  const [inputValue, setInputValue] = useState([]);


  const searchFn = async (q) => {
    setResult(undefined);

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

  const onSearch = (value: string) => {
    searchFn(value)
  };


  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  };

  const getRandomSwapListFn = async () => {
    setRandomSwapList([]);

    try {
      const response = await fetch("/api/getRandomSwap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ q }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      console.log(data.result, 'data.result')
      setRandomSwapList(data.result);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      console.log(error.message);
    }
  }

  useEffect(() => {
    getRandomSwapListFn()
  }, [])



  useEffect(() => {
    if (result) {
      console.log(result, 'result')
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

        <Search placeholder="请输入你想要执行的操作" value={inputValue} onChange={onChange} size="large" onSearch={onSearch} style={{ width: 400, margin: '40px 0' }} />
        <Space size={[0, 8]} wrap style={{ marginBottom: '100px' }}>
          {randomSwapList.length > 0 ? randomSwapList?.map(item => (
            <Tag
              style={{
                height: 40,
                fontSize: 18,
                lineHeight: '40px',
                cursor: 'pointer'
              }}
              key={item} color="#2db7f5" onClick={() => {
                onSearch(item)
                setInputValue(item)
              }}>{item}</Tag>
          ))

            : (
              Array(5).fill(0).map((_, item) => (
                <Skeleton.Button active key={item} shape={'default'} style={{ marginRight: 40 }} size={'large'} />
              ))
            )
          }
          <SyncOutlined spin={randomSwapList.length == 0} onClick={getRandomSwapListFn} />
        </Space>

        {result ? (<SwapWidget
          width={500}
          hideConnectionUI={true}
          permit2={true}
          defaultInputTokenAddress={result?.defaultInputTokenAddress || 'NATIVE'}
          defaultOutputTokenAddress={result?.defaultOutputTokenAddress || 'NATIVE'}
          defaultInputAmount={result?.defaultInputAmount}
          brandedFooter={false} />)
          : null
          //  (<Skeleton.Button active shape={'default'} size={'large'} block />)

        }

      </main>


    </div>
  );
};

export default Home;


