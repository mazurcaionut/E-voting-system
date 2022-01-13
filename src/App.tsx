import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import Token from "./artifacts/contracts/Token.sol/Token.json";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider } from "@ethersproject/providers";

import styled, { css } from "styled-components";

export const StyledButton = styled.button(
  ({ theme }) => css`
    color: black;
    font-size: 30px;
    width: fit-content;
    white-space: nowrap;
    cursor: pointer;
    height: 100px;
    text-align: center;
    height: 200px;
    background-color: yellow;
    border: 20px solid blue;
    transition: all 0.5s ease;

    &:hover {
      background-color: blue;
      border: 20px solid yellow;
      color: white;
    }
  `
);

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
  const [greeting, setGreetingValue] = useState<string>("");
  const [userAccount, setUserAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const getBalance = async () => {
    const ethereum = (await detectEthereumProvider()) as ExternalProvider;

    if (ethereum.isMetaMask) {
      const [account] = await ethereum.request?.({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
      const balance = await contract.balanceOf(account);
      console.log("Balance: ", balance.toString());
    }
  };

  const sendCoins = async () => {
    const ethereum = (await detectEthereumProvider()) as ExternalProvider;

    if (ethereum.isMetaMask) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transation = await contract.transfer(userAccount, parseInt(amount));
      await transation.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  };

  const requestAccount = async () => {
    const ethereum = (await detectEthereumProvider()) as ExternalProvider;

    await ethereum.request?.({ method: "eth_requestAccounts" });
  };

  const fetchGreeting = async () => {
    const provider = (await detectEthereumProvider()) as ExternalProvider;

    if (provider.isMetaMask) {
      const ethereumProvider = new ethers.providers.Web3Provider(provider);
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        ethereumProvider
      );
      try {
        const data = await contract.greet();
        console.log("data: ", data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };

  const setGreeting = async () => {
    if (!greeting) return;

    const provider = (await detectEthereumProvider()) as ExternalProvider;

    if (provider.isMetaMask) {
      await requestAccount();
      const ethereumProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethereumProvider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      setGreetingValue("");
      await transaction.wait();
      fetchGreeting();
    }
  };

  return (
    <div className="App">
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <p style={{ color: "white", fontSize: "40px", fontStyle: "italic" }}>
          E-voting-system
        </p>
        <div
          style={{
            display: "flex",
            height: "fit-content",
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <StyledButton onClick={fetchGreeting}>Fetch greeting</StyledButton>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              height: "fit-content",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <StyledButton onClick={setGreeting}>Set greeting</StyledButton>
            <input
              style={{ marginTop: "20px", fontSize: "40px" }}
              onChange={(e) => setGreetingValue(e.target.value)}
              placeholder="Set greeting"
              value={greeting}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            height: "fit-content",
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <StyledButton onClick={getBalance}>Get balance</StyledButton>
          <StyledButton onClick={sendCoins}>Send coins</StyledButton>
          <input
            style={{ marginTop: "20px", fontSize: "40px" }}
            onChange={(e) => setUserAccount(e.target.value)}
            placeholder="Account ID"
            value={userAccount}
          />
          <input
            style={{ marginTop: "20px", fontSize: "40px" }}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            value={amount}
          />
        </div>
        <p style={{ color: "white", fontSize: "40px", fontStyle: "italic" }}>
          Bottom
        </p>
      </div>
    </div>
  );
}

export default App;
