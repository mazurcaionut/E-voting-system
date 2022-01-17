import {
  BallotDetailsContainer,
  BallotManagerRoot,
  BMCenterSection,
  BMTitle,
  ContractDetails,
  ElectionMetadata,
  NewBallotContainer,
  NewBallotContract,
  SpanLines,
  StyledMUIButton,
  StyledMUITextField,
  StyledTextField,
} from "./BallotManager.styles";
import { Button, CircularProgress, TextField } from "@mui/material";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useETHAccount } from "../../customHooks/useETHAccount";
import Voting from "../../artifacts/contracts/Voting.sol/Ballot.json";
// import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Contract } from "ethers";
import Web3 from "web3";

interface IBallotManagerProps {
  voter?: boolean;
}

export const BallotManager = (props: IBallotManagerProps) => {
  const [ballotName, setBallotName] = useState("Chairman");
  const [proposal, setProposal] = useState("Should we re-elect Jack?");
  const { loadingA } = useETHAccount();
  const [ballotContract, setBallotContract] = useState<Contract | null>(null);
  const [ballotContractAddress, setBallotContractAddress] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [clicked, setClicked] = useState(false);

  const onDeployClick = async () => {
    setClicked(true);
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    // if (window.ethereum) {
    // }
    // const web3 = new Web3();
    let initialBallotContract = new web3.eth.Contract(Voting.abi as AbiItem[]);
    const accountAddress = web3.givenProvider.selectedAddress;
    const gasPrice = await web3.eth.getGasPrice();
    initialBallotContract
      .deploy({
        data: Voting.bytecode,
        arguments: [ballotName, proposal],
      })
      .send(
        {
          from: accountAddress,
          gas: 1308700,
          gasPrice: gasPrice,
        },
        (error, transactionHash) => {
          console.log("Transaction hash: ", transactionHash);
        }
      )
      .on("error", (error) => {
        console.log("b");
      })
      .on("transactionHash", (transactionHash) => {
        console.log("c");
      })
      .on("receipt", (receipt) => {
        console.log("Finally deployed");
        console.log("Contract address: ", receipt.contractAddress);

        setBallotContractAddress(receipt.contractAddress as string);
        setDeployed(true);
        setClicked(false);
        // receipt.contractAddress;
      });
    // .on("confirmation", (confirmationNumber, receipt) => {})
    // .then((newContractInstance) => {
    //   console.log(newContractInstance.options.address); // instance with the new contract address
    // });
  };

  const onBallotNameChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setBallotName(e.target.value);

  const onProposalChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setProposal(e.target.value);

  //   const onWatchVoteEnd = () => {
  //     Ballot.events.voteEnded({
  //     }, (error, event) => {
  //         console.log(event.returnValues.finalResult);
  //         loadState(Ballot);
  //         loadFinalResult(Ballot);
  //         $("#loaderStartVote").hide();
  //         $("#btnEnd").hide();
  //     })
  //     .on('data', (event) => {
  //     })
  //     .on('changed', (event) => {
  //         // remove event from local database
  //     })
  //     .on('error', console.error)
  // }

  return (
    <BallotManagerRoot>
      <BMCenterSection>
        {deployed ? null : (
          <>
            <BMTitle>{props.voter ? `Vote` : `Ballot Manager`}</BMTitle>
            <NewBallotContainer>
              <NewBallotContract>
                {props.voter ? `Ballot contract` : `New Ballot Contract`}
              </NewBallotContract>
              <BallotDetailsContainer>
                <StyledMUITextField
                  id="outline-basic"
                  label={
                    props.voter ? `Ballot address` : `Ballot official name`
                  }
                  variant="outlined"
                  value={ballotName}
                  onChange={onBallotNameChange}
                />

                {props.voter ? null : (
                  <StyledMUITextField
                    id="outline-basic"
                    label="Proposal"
                    variant="outlined"
                    value={proposal}
                    onChange={onProposalChange}
                  />
                )}

                {/* <TextField
            id="outline-basic"
            label="Ballot Address"
            variant="outlined"
            value={ballotName}
            onChange={onBallotNameChange}
            inputProps={{ sx: { fontSize: "20px" } }}
            InputLabelProps={{
              sx: { fontSize: "20px" },
            }}
            sx={{ marginBottom: "10px", marginTop: "10px" }}
          />

          {props.voter ? null : (
            <TextField
              id="outline-basic"
              label="Proposal"
              variant="outlined"
              value={proposal}
              onChange={onProposalChange}
              inputProps={{ sx: { fontSize: "20px" } }}
              InputLabelProps={{
                sx: { fontSize: "20px" },
              }}
              sx={{ marginBottom: "10px", marginTop: "10px" }}
            />
          )} */}

                <StyledMUIButton variant="contained" onClick={onDeployClick}>
                  Deploy
                </StyledMUIButton>
                {loadingA ? <CircularProgress /> : null}

                {/* <Button
            variant="contained"
            sx={{ width: "100px", fontSize: "30px", height: "50px" }}
          >
            Go
          </Button> */}
              </BallotDetailsContainer>
            </NewBallotContainer>
          </>
        )}

        {clicked && !deployed ? (
          <CircularProgress
            sx={{ marginTop: "10px", alignSelf: "center" }}
            size={"60px"}
          />
        ) : null}

        {!deployed ? null : (
          <>
            <ElectionMetadata>
              <ContractDetails>
                <NewBallotContract>Contract Details</NewBallotContract>
                <SpanLines>
                  <p>Election state: </p>
                  <p>{ballotName}</p>
                </SpanLines>
                <SpanLines>
                  <p>Ballot Official Name: </p>
                  <p>{ballotName}</p>
                </SpanLines>

                <SpanLines>
                  <p>Proposal: </p>
                  <p>{proposal}</p>
                </SpanLines>

                <SpanLines>
                  <p>Address: </p>
                  <p>{ballotContractAddress}</p>
                </SpanLines>
              </ContractDetails>
              <ContractDetails>
                <NewBallotContract>Vote Details</NewBallotContract>
                <SpanLines>
                  <p>Result: </p>
                  <p>Test</p>
                </SpanLines>

                <SpanLines>
                  <p>Voters: </p>
                  <p>Test</p>
                </SpanLines>

                <SpanLines>
                  <p>Votes: </p>
                  <p>Test</p>
                </SpanLines>
              </ContractDetails>
            </ElectionMetadata>
          </>
        )}
      </BMCenterSection>
    </BallotManagerRoot>
  );
};
