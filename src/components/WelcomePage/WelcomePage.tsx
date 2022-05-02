import React, { useEffect } from "react";
import { useState } from "react";
import Token from "../../artifacts/contracts/Token.sol/Token.json";
import Greeter from "../../artifacts/contracts/Greeter.sol/Greeter.json";
import Voting from "../../artifacts/contracts/Ballot.sol/Ballot.json";
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
