import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import Lottie from "react-lottie";
import animationData from "./assets/mining.json";
import animationData2 from "./assets/ether.json";
import { motion } from "framer-motion";
import { fade } from "./animations.jsx";

export default function App() {
  // State variable to hold our user's public wallet address 
  const [currentAccount, setCurrentAccount] = React.useState("");
  const contractAddress = "0x97c6Cc2Ae3eFE28054acA035ACAEFA483aAC30Fa";
  const contractABI = abi.abi;
  const [allWaves, setAllWaves] = React.useState([]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(null);
  const [message, setMessage] = React.useState("");

  const checkIfWalletIsConnected = () => {
    // Make sure we have access to the ethereum object 
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      return
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        // We could have multiple accounts. Check for one 
        if (accounts.length !== 0) {
          //Grab first account we have access to 
          const account = accounts[0];
          console.log("Found an authorized account: ", account)
          //Store the users public wallet address for later! 
          setCurrentAccount(account);
          getAllWaves();
        } else {
          console.log("No authorized account found")
        }
      })
  };

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get MetaMask! If on a mobile device use the browser built into MetaMask!")
    }

    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log("Connected", accounts[0])
        setCurrentAccount(accounts[0])
      })
      .catch(err => console.log(err));
    getAllWaves();
    getTotal();
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves();
    console.log("Retrieved total wave count...", count.toNumber());

    const waveTxn = await waveportalContract.wave(message);
    setIsPlaying(!isPlaying);
    console.log("Mining...", waveTxn.hash);
    await waveTxn.wait();
    console.log("Mined --", waveTxn.hash)

    count = await waveportalContract.getTotalWaves();
    setIsPlaying(false);
    console.log("Retrieved total wave count...", count.toNumber());
    setTotalCount(count.toNumber());
    getAllWaves();
  };

  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves();

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        // changed waver to address
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
      })
    })
    setAllWaves(wavesCleaned);

  }

  const getTotal = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);
    let count = await waveportalContract.getTotalWaves();
    setTotalCount(count.toNumber());
  }

  const textInputHandler = (e) => {
    setMessage(e.target.value);
  }

  // Primary method 
  React.useEffect(() => {
    if (currentAccount) {
      getAllWaves();
      getTotal();
    } else {
      checkIfWalletIsConnected();
    }
  }, [currentAccount]);

  // Test method
  //  React.useEffect(checkIfWalletIsConnected, getTotal);

  // Lottie stuff 

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const cryptoOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData2,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  }

  return (
    <motion.div variants={fade} initial={"hidden"} animate={"show"} className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <Lottie className="lottie" options={cryptoOptions} height={300} width={300} />
          <h3>Welcome to the Ether</h3>
        </div>

        <div className="bio">
          <p>
            My name is <a href="https://bio.link/stevedsimkins" target="_blank">Steve</a>,
            and with the help of <a href="https://buildspace.so/" target="_blank">@_buildspace</a>
            I've built a working Web3 app with Solidity and Ethereum smart contracts!
            Send me the name of your favorite coffee shop and watch it be added to the blockchain!
          </p>
          <p>
            You will need <a href="https://metamask.io/" target="_blank">Metamask</a><br />
            and some <a href="https://app.mycrypto.com/faucet" target="_blank">Rinkeby testnet</a> to try this out.
          </p>
        </div>
        <div className="counterContainer">
          {!isPlaying ? (
            <div className="counter">
              {!currentAccount ? null : (
                <h4>Total Coffee Shops:</h4>
              )}
              <h1>{totalCount}</h1>
              {!currentAccount ? null : (
                <input type="text" placeholder="Favorite Coffee Spot? ☕️" onChange={textInputHandler} />
              )}
            </div>
          ) : (
            <div className="counter">
              <Lottie className="lottie" options={defaultOptions} height={300} width={300} />
              <p>Mining...</p>
            </div>
          )}
        </div>
        {!currentAccount ? null : (
          <button className="waveButton" onClick={wave}>
            ✨ Send it ✨
          </button>
        )}
        {currentAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="allWavesContainer">
          {allWaves.map((wave, index) => {
            return (
              <div className="waveContainer">
                <div><h3>🏠 Address:</h3><p>{wave.address}</p></div>
                <div><h3>⏱  Time:</h3><p>{wave.timestamp.toString()}</p></div>
                <div><h3>📝 Message:</h3><p>{wave.message}</p></div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div >
  );
};
