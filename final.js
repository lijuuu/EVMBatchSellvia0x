// Procedure 
// 1) run npm install in Command Prompt 
// 2) Input all the details in below
// 3) run node final.js

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
const INFURA_API_KEY = ''
const Zero_X_Key = ''
const Moralis_API_Key = '';

const takerAddress = ''
const WALLET_SECRET = '' 

const networkName = 'Binance';          //Enter your networkName = Ethereum,Goerli,Polygon,Mumbai,Binance,Fantom, Avalanche,Arbitrum
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



const { ethers,BigNumber } = require('ethers');
const qs = require('qs');
const Moralis = require("moralis").default;
const fs = require('fs');
const ERC20_ABI = require('./tokenAbi.json');
const balanceFetched = require('./balanceFetched.json'); 
const { response } = require('express');



//Change by Chain choosed (mapping)
const networkMapping = {
    'Ethereum': {
      Zero_X_URL: 'https://api.0x.org/',
      RPC_URL: 'https://mainnet.infura.io/v3/'+INFURA_API_KEY,
      nativeAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      nativeCoinName: 'WETH',
      chainId: "1",
      EXCHANGE_PROXY_ADDRESS: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    },
    'Goerli': {
      Zero_X_URL: 'https://goerli.api.0x.org/',
      RPC_URL: 'https://goerli.infura.io/v3/'+INFURA_API_KEY,
      nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      nativeCoinName: 'ETH',
      chainId:"5",
      EXCHANGE_PROXY_ADDRESS: '0xf91bb752490473b8342a3e964e855b9f9a2a668e',
    },
    'Polygon': {
      Zero_X_URL: 'https://polygon.api.0x.org/',
      RPC_URL: 'https://polygon-mainnet.infura.io/v3/'+INFURA_API_KEY,
      nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      nativeCoinName: 'POLYGON',
      chainId:"137",
      EXCHANGE_PROXY_ADDRESS: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    },
    'Mumbai': {
      Zero_X_URL: 'https://mumbai.api.0x.org',
      RPC_URL: 'https://polygon-mumbai.infura.io/v3/'+INFURA_API_KEY,
      nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      nativeCoinName: 'POLYGON_TESTNET',
      chainId:'80001',
      EXCHANGE_PROXY_ADDRESS: '0xf471d32cb40837bf24529fcf17418fc1a4807626',
    },
    'Binance': {
        Zero_X_URL: 'https://bsc.api.0x.org/',
        RPC_URL: 'https://1rpc.io/bnb',
        nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        nativeCoinName: 'BNB',
        chainId:'56',
        EXCHANGE_PROXY_ADDRESS: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      },
    'Fantom': {
        Zero_X_URL: 'https://fantom.api.0x.org/',
        RPC_URL: 'https://1rpc.io/ftm',
        nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        nativeCoinName: 'Fantom',
        chainId: '250',
        EXCHANGE_PROXY_ADDRESS: '0xdef189deaef76e379df891899eb5a00a94cbc250',
      },
    'Avalanche': {
        Zero_X_URL: 'https://avalanche.api.0x.org/',
        RPC_URL: 'https://polygon-mumbai.infura.io/v3/'+INFURA_API_KEY,
        nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        nativeCoinName: 'AvalancheETH',
        chainId: '43114',
        EXCHANGE_PROXY_ADDRESS: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      },    
    'Arbitrum': {
        Zero_X_URL: 'https://arbitrum.api.0x.org/',
        RPC_URL: 'https://avalanche-mainnet.infura.io/v3/'+INFURA_API_KEY,
        nativeAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        nativeCoinName: 'ArbitrumETH',
        chainId:'42161',
        EXCHANGE_PROXY_ADDRESS: '0xdef1c0ded9bec7f1a1670819833240f027b25eff'
      },  
  };

  //Choosing Values with mapping
  const valuesForNetwork = networkMapping[networkName];
  const Zero_X_URL = valuesForNetwork.Zero_X_URL;
  const RPC_URL = valuesForNetwork.RPC_URL;
  const nativeAddress = valuesForNetwork.nativeAddress;
  const nativeCoinName = valuesForNetwork.nativeCoinName;
  const EXCHANGE_PROXY_ADDRESS = valuesForNetwork.EXCHANGE_PROXY_ADDRESS;
  const chainId = valuesForNetwork.chainId;

  //moralis Info
  const chain = chainId;
  const address = takerAddress;


const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(WALLET_SECRET);
const signer = wallet.connect(provider);


async function main() {

await Moralis.start({ apiKey: Moralis_API_Key });
const balanceCheck = await Moralis.EvmApi.token.getWalletTokenBalances({ address, chain });
const jsonResponse = balanceCheck.toJSON();
const updatedResponse = jsonResponse.map(token => ({
    ...token,
    UpdatedBalance: parseFloat(token.balance) / 10 ** token.decimals,
  }));
  const filteredBalance = updatedResponse.filter(token => token.possible_spam == false);
  console.log(filteredBalance);

  const priceCheck = async () => {
    const tokenPrices = [];
    for (const token of filteredBalance) {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.token_address}&vs_currencies=usd`);
        const data = await response.json();
        const price = data[token.token_address].usd;
        const totalPrice = price*token.UpdatedBalance;
            if (totalPrice >= 8) {
                    tokenPrices.push({
                      ...token,
                      price: price,
                      totalPrice: totalPrice,
                    }
              );
            console.log(`The ${token.name} can be sold for ${totalPrice}`);
            }
      } catch (error) {
        console.log(`Error fetching price for token ${token.name}`);
        continue;
      }
    }
    console.log(`Balance Fetch Finished`);
    fs.writeFileSync('balanceFetched.json', JSON.stringify(tokenPrices, null, 2));
  };
  priceCheck()
  console.log('balance fetch successful')

  console.log('*Starting Swap*')

setTimeout(async () => {
for (let tokenInfo of balanceFetched) {
    const inputTokenAddress = tokenInfo.token_address;
    const sellAmount = tokenInfo.balance;
    const decimals = tokenInfo.decimals;
    const inputTokenName = tokenInfo.name;
    const totalPrice = tokenInfo.totalPrice;
    const UpdatedBalance = tokenInfo.UpdatedBalance;


const params = {
    buyToken: nativeAddress,
    sellToken: inputTokenAddress, 
    sellAmount :sellAmount,
    takerAddress
}

//Sending Swap Info
console.log(`*Selling ${totalPrice} USD worth of  ${UpdatedBalance} ${inputTokenName}  *`);

const headers = {'0x-api-key': Zero_X_Key }  // This is a placeholder. Get your live API key from the 0x Dashboard (https://dashboard.0x.org/apps)

// Set up a inputToken allowance on the 0x contract if needed.
const UNI = new ethers.Contract(inputTokenAddress, ERC20_ABI, signer);
const AllowanceValue = await UNI.allowance(params.takerAddress, EXCHANGE_PROXY_ADDRESS);
const currentAllowance = ethers.BigNumber.from(AllowanceValue);

if (currentAllowance.lt(ethers.BigNumber.from(sellAmount))) {
  console.log('*Current Allowance not enough for Swap, Initiating Allowance Approval*')
  const approveTx = await UNI.approve(EXCHANGE_PROXY_ADDRESS, ethers.BigNumber.from(sellAmount));
  await approveTx.wait();
  console.log('*Allowance Approval Success*')
} else {
  console.log('*Current Allowance enough for Swap*')
}

try {
  const response = await fetch(`${Zero_X_URL}/swap/v1/quote?${qs.stringify(params)}`, { headers });
  
  console.log(`${Zero_X_URL}/swap/v1/quote?${qs.stringify(params)}`, { headers });

  if (!response.ok) {
      throw new Error(`Please check whether your API key, Paramters are correct`);
  }

  const responseData = await response.json();
  console.log('*swapping....*');
  const { to, data, value,  gasPrice } = responseData;
  const transactionResponse = await signer.sendTransaction({ to, data, value, gasPrice });
  await transactionResponse.wait(); // Wait for the transaction to be mined

  console.log('Bought',((responseData.grossBuyAmount) / Math.pow(10, 18).toFixed(8)),nativeCoinName);
} catch (error) {
  console.error('Oops looks like the value specified to the response is wrong, Please check whether the sellAmount is with neccessary decimals');
}
}
//Checking for any more tokens in json
if (balanceFetched.length === balanceFetched.length) {
    console.log('Swap Finished');
  } else {
    console.log('Starting next Swap');
  }
}, 10000);
}
  
main().catch(console.error);
