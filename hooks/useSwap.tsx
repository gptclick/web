 // @ts-ignore
import {
  goerli,
  useAccount,
  useContract,
  useProvider,
  useSigner,
} from 'wagmi';
import IUniswapV3PoolArtifact from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import {
  ethers
} from 'ethers';
import {
  Token
} from '@uniswap/sdk-core';
import {
  Pool,
  computePoolAddress,
  FeeAmount
} from '@uniswap/v3-sdk';
import ISwapRouterArtifact from '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json';
import useWETH from './useWETH';

interface Immutables {
  token0: string;
  token1: string;
  fee: number;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
}

const WETH_DECIMALS = 18;
const UNI_DECIMALS = 18;
// WETH - UNI pool with 0.3% fee
const POOL_ADDRESS = '0x07A4f63f643fE39261140DF5E613b9469eccEC86';
const ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

const POOL_FACTORY_CONTRACT_ADDRESS ='0x1F98431c8aD98523631AE4a59f267346ea31F984'

//Universal Router
const Universal_ADDRESS ='0x4648a43B2C14Da09FdF82B161150d3F634f40491'

const useSwap = () => {
  const provider = useProvider();
  const {
    address
  } = useAccount();
  const {
    data: signer
  } = useSigner();
  const routerContract = useContract({
    address: ROUTER_ADDRESS,
    abi: ISwapRouterArtifact.abi,
    signerOrProvider: signer,
  });

  const universalContract = useContract({
    address: Universal_ADDRESS,
    abi: ISwapRouterArtifact.abi,
    signerOrProvider: signer,
  });

  const {
    approve,
    deposit
  } = useWETH();

  const LINK_TOKEN = new Token(
    137,
    '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
    18,
  )

  const USDC_TOKEN = new Token(
    137,
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    6,
  )

  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: LINK_TOKEN,
    tokenB: USDC_TOKEN,
    fee: FeeAmount.MEDIUM

  })

  const poolContract = useContract({
    address: currentPoolAddress,
    abi: IUniswapV3PoolArtifact.abi,
    signerOrProvider: provider,
  });
  console.log(poolContract, 'poolContract', currentPoolAddress)

  const getPoolInfo =async (tokenA: any, tokenB: any, poolFee: any)=> {
    if (!provider) {
      throw new Error('No provider')
    }

    const currentPoolAddress = computePoolAddress({
      factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
      tokenA: tokenA,
      tokenB: tokenB,
      fee:poolFee,
    })

    const poolContract = new ethers.Contract(
      currentPoolAddress,
      IUniswapV3PoolArtifact.abi,
      provider
    )

    console.log(currentPoolAddress, poolContract,'poolContract')

    const [token0, token1, fee, tickSpacing, liquidity, slot0] =
      await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.liquidity(),
        poolContract.slot0(),
      ])

    return {
      token0,
      token1,
      fee,
      tickSpacing,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    }
  }


  const swap = async (amount: number) => {
    if (!routerContract)
      throw new Error('Router contract has not been initialized');

    await deposit(amount);
    await approve(ROUTER_ADDRESS, amount);

    const immutables = await getPoolImmutables();

    const parsedAmount = ethers.utils.parseUnits(
      amount.toString(),
      UNI_DECIMALS
    );

    const params = {
      tokenIn: immutables.token1,
      tokenOut: immutables.token0,
      fee: immutables.fee,
      recipient: address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: parsedAmount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const txn = await routerContract.exactInputSingle(params, {
      gasLimit: ethers.utils.hexlify(700000),
    });

    return txn;
  };

  const getQuote = async (amount: number) => {
    const [immutables, state] = await Promise.all([
      getPoolImmutables(),
      getPoolState(),
    ]);

    const tokenA = LINK_TOKEN|| new Token(goerli.id, immutables.token0, UNI_DECIMALS);
    const tokenB = USDC_TOKEN|| new Token(goerli.id, immutables.token1, WETH_DECIMALS);

    const pool = new Pool(
      tokenA,
      tokenB,
      immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick
    );

    const outputAmount = amount * parseFloat(pool.token1Price.toFixed(2));

    return outputAmount;
  };

  const getPoolImmutables = async () => {
    if (!poolContract)
      throw new Error('Pool contract has not been initialized');

    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);

    const immutables: Immutables = {
      token0,
      token1,
      fee,
    };
    return immutables;
  };

  const getPoolState = async () => {
    if (!poolContract)
      throw new Error('Pool contract has not been initialized');

    const [liquidity, slot] = await Promise.all([
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

    const PoolState: State = {
      liquidity,
      sqrtPriceX96: slot[0],
      tick: slot[1],
    };

    return PoolState;
  };

  return {
    getQuote,
    swap,
    getPoolInfo
  };
};

export default useSwap;