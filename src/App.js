import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import Lottie from "react-lottie";
import animationData from "./assets/circle.json"

export default function App() {
  // State variable to hold our user's public wallet address 
  const [currentAccount, setCurrentAccount] = React.useState("");
  const contractAddress = "0x12bd405952342387340953883FCcCCc44d19ef67";
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
      alert("Get Metamask!")
    }

    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log("Connected", accounts[0])
        setCurrentAccount(accounts[0])
      })
      .catch(err => console.log(err));
    checkIfWalletIsConnected();
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
    checkIfWalletIsConnected();
    getTotal();
    getAllWaves();
  }, []);

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

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          With the help of @_Buildspace I've built a working Web3 app with Solidity
          and Ethereum smart contracts! Give me a wave and watch it turn into a
          blockchain through an Ethereum smart contract!
        </div>
        <div className="counterContainer">
          {!isPlaying ? (
            <div className="counter">
              <p>Total Waves:</p>
              <h1>{totalCount}</h1>
              <input type="text" placeholder="send me a message!" onChange={textInputHandler} />
            </div>
          ) : (
            <div className="counter">
              <Lottie className="lottie" options={defaultOptions} height={300} width={300} />
              <p>Sending your wave...</p>
            </div>
          )}
        </div>

        <button className="waveButton" onClick={wave}>
          ✨ Wave at Me ✨
        </button>

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
    </div>
  );
};
