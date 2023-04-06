import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import useSwap from '../hooks/useSwap';

const UNI_ADDRESS = '0x84789B26dB229Ec68052e67B18933C763F7226F3';

const SwapCard = () => {
  const [quote, setQuote] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  const [load,setLoad]=useState(false)
  const { address } = useAccount();
  const { data: ETHBalance } = useBalance({
    address,
    watch: true,
  });
  const { data: UNIBalance } = useBalance({
    address,
    token: UNI_ADDRESS,
    watch: true,
  });

  const { getQuote, swap } = useSwap();

  const onChangeAmountInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAmount(parseFloat(event.target.value));
    const quote = await getQuote(parseFloat(event.target.value));
    setQuote(quote);
  };

  const onClickSwapButton = async () => {
    const txn = await swap(amount);
    await txn.wait();
  };

  useEffect(()=>{
    setLoad(true)
  },[])

  return (
    <>
      <input
        type="text"
        placeholder="Amount in"
        onChange={onChangeAmountInput}
      />
      <p>ETH</p>
      {load &&<p>Balance: {ETHBalance?.formatted}</p>}
      <input
        type="text"
        placeholder="Amount out"
        disabled
        value={quote === 0 ? '' : quote}
      />
      <p>UNI</p>
      {load&&<p>Balance: {UNIBalance?.formatted}</p>}
      <button disabled={false} onClick={onClickSwapButton}>
        Swap
      </button>
    </>
  );
};

export default SwapCard;