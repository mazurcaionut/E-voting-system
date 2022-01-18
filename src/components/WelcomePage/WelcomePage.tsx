import React, { useEffect } from "react";
import { useState } from "react";
import Token from "../../artifacts/contracts/Token.sol/Token.json";
import Greeter from "../../artifacts/contracts/Greeter.sol/Greeter.json";
import Voting from "../../artifacts/contracts/Voting.sol/Ballot.json";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import video from "../../videos/votingVideo.mp4";
import {
  BackgroundVideo,
  ButtonsContainer,
  StyledButton,
  WelcomePageRoot,
} from "./WelcomePage.styles";
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const WelcomePage = () => {
  const history = useHistory();

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

    // const web3 = new Web3();

    // // web3.currentProvider;

    // let ballotContract = new web3.eth.Contract(Voting.abi as AbiItem[]);

    // const gasPrice = await web3.eth.getGasPrice();

    // ballotContract
    //   .deploy({
    //     data: Voting.bytecode,
    //     arguments: [],
    //   })
    //   .send(
    //     {
    //       from: "",
    //       gas: 1308700,
    //       gasPrice: gasPrice,
    //     },
    //     (error, transactionHash) => {}
    //   )
    //   .on("error", (error) => {})
    //   .on("transactionHash", (transactionHash) => {})
    //   .on("receipt", (receipt) => {
    //     receipt.contractAddress;
    //   });

    if (ethereum.isMetaMask) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      await contract.transfer();
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

  const onBallotManagerRedirect = () => history.push("/ballotManager");

  const onVoteRedirect = () => history.push("/vote");

  return (
    <WelcomePageRoot>
      <BackgroundVideo playsInline autoPlay muted loop>
        <source src={video}></source>
      </BackgroundVideo>
      <ButtonsContainer>
        <StyledButton onClick={onBallotManagerRedirect}>
          Ballot manager
        </StyledButton>
        <StyledButton onClick={onVoteRedirect}>Voter</StyledButton>
      </ButtonsContainer>
    </WelcomePageRoot>
  );
};
