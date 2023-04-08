import React, { useEffect, useState } from 'react';
import { useAccount, useBalance, goerli } from 'wagmi';
import useSwap from '../hooks/useSwap';
import { FeeAmount } from '@uniswap/v3-sdk'
import {
  Token
} from '@uniswap/sdk-core';

const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const USDT_ADDRESS = '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49'
const LINK_ADDRESS = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'

const USDC_ADDRESS_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
const LINK_ADDRESS_POLYGON ='0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39'

const SwapCard = () => {
  const [quote, setQuote] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  const [load, setLoad] = useState(false)
  const { address } = useAccount();
  const { data: ETHBalance } = useBalance({
    address,
    token: LINK_ADDRESS_POLYGON,
    watch: true,
  });
  const { data: UNIBalance } = useBalance({
    address,
    token: USDC_ADDRESS_POLYGON,
    watch: true,
  });

  const { getQuote, swap, getPoolInfo } = useSwap();

  const onChangeAmountInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAmount(parseFloat(event.target.value));
    const quote = await getQuote(parseFloat(event.target.value));
    setQuote(quote);
  };


  // const getInfo=async()=>{
  //   const { token0,
  //     token1,
  //     fee,
  //     tickSpacing,
  //     liquidity,
  //     sqrtPriceX96,
  //     tick, } = await getPoolInfo(
  //       new Token(goerli.id, LINK_ADDRESS, 18),
  //       new Token(goerli.id, USDT_ADDRESS, 6),
  //       FeeAmount.MEDIUM
  //     )

  //   return {
  //       token0,
  //       token1,
  //       fee,
  //       tickSpacing,
  //       liquidity,
  //       sqrtPriceX96,
  //       tick,
  //   }
  // }

  

  

  const onClickSwapButton = async () => {
    const txn = await swap(amount);
    await txn.wait();
  };

  useEffect(() => {
    setLoad(true)
    // getInfo()
  }, [])

  return (
    <>
      <input
        type="text"
        placeholder="Amount in"
        onChange={onChangeAmountInput}
      />
      <p>ETH</p>
      {load && <p>Balance: {ETHBalance?.formatted}</p>}
      <input
        type="text"
        placeholder="Amount out"
        disabled
        value={quote === 0 ? '' : quote}
      />
      <p>UNI</p>
      {load && <p>Balance: {UNIBalance?.formatted}</p>}
      <button disabled={false} onClick={onClickSwapButton}>
        Swap
      </button>
    </>
  );
};

export default SwapCard;