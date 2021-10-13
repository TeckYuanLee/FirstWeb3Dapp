import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  /*
   * All state property to store all cookies
   */
  const [allCookies, setAllCookies] = useState([]);
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const [tweetValue, setTweetValue] = React.useState("")
  const [numOfCookies, getTotalCookies] = useState("")
  const contractAddress = "0xc763b8e20a95E07E89B2F80278069634b843BD6b";

  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllCookies();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

const givecookies = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalCookies();
        console.log("Retrieved total cookies count...", count.toNumber());
        /*
        * Execute the actual wave from your smart contract
        */
        const cookiesTxn = await wavePortalContract.giveCookies(tweetValue, { gasLimit: 300000 });
        console.log("Mining...", cookiesTxn.hash);

        await cookiesTxn.wait();
        console.log("Mined -- ", cookiesTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

const getAllCookies = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const cookies = await wavePortalContract.getAllCookies();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let cookiesCleaned = [];
        cookies.forEach(cookie => {
          cookiesCleaned.push({
            address: cookie.giver,
            timestamp: new Date(cookie.timestamp * 1000),
            message: cookie.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllCookies(cookiesCleaned);

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewCookies", (from, timestamp, message) => {
          console.log("NewCookies", from, timestamp, message);

          setAllCookies(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const cookiesCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        let numOfCookies = await wavePortalContract.getTotalCookies();
        getTotalCookies(numOfCookies.toLocaleString())
        console.log("Retrieved total cookies count...", numOfCookies.toLocaleString())
        } else {
        console.log("Ethereum object doesn't exist!")
        }
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(() => {
    checkIfWalletIsConnected();
    cookiesCount();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        🍪 Hey there! 🍪
        </div>

        <div className="bio">
        I am TY, a student from 42KL and I love cryptocookies 🍪! 
        Connect your Ethereum wallet and send me some cookies 🍪 
        for a chance to win 0.0001 ether!
        </div>

        {currentAccount && (
          <p className="cookiesCount">
            <b>{numOfCookies} {numOfCookies == 1 ? "person has " : "people have "}
            sent me a cookie so far!</b>
          </p>
        )}
        {
          currentAccount ? (<textarea name="tweetArea"
            placeholder="leave me a message"
            type="text"
            id="tweet"
            value={tweetValue}
            onChange={e => setTweetValue(e.target.value)} />) : null
        }
        {currentAccount && (
        <button className="givecookiesButton" onClick={givecookies}>
          Give me Cookies 🍪 ... Now!
        </button>
        )}

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allCookies.map((cookie, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'OldLace',
                marginTop: '16px',
                padding: '8px',
              }}
            >
              <div>Address: {cookie.address}</div>
              <div>Time: {cookie.timestamp.toString()}</div>
              <div>Message: {cookie.message}</div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
}

export default App