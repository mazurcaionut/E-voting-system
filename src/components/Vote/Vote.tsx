import { CircularProgress } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useETHAccount } from "../../customHooks/useETHAccount";
import Voting from "../../artifacts/contracts/Voting.sol/Ballot.json";
import {
  BallotDetailsContainer,
  BallotManagerRoot,
  BMCenterSection,
  BMTitle,
  ContractDetails,
  NewBallotContainer,
  NewBallotContract,
  SpanLines,
  StyledMUIButton,
  StyledMUITextField,
} from "../BallotManager/BallotManager.styles";
import Web3 from "web3";
import { Contract, ethers } from "ethers";

export const Vote = () => {
  const { loadingA } = useETHAccount();
  const [electionFetched, setElectionFetched] = useState(false);
  const [ballotAddressToFetch, setBallotAddressToFetch] = useState("");
  const [senderAccountAddress, setSenderAccountAddress] = useState("");
  const [ballotName, setBallotName] = useState("");
  const [proposal, setProposal] = useState("");
  const [result, setResult] = useState(0);
  const [ethersContract, setEthersContract] = useState<Contract | null>(null);
  const [electionState, setElectionState] = useState("");
  const [voted, setVoted] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [electionOver, setElectionOver] = useState(false);

  useEffect(() => {
    if (electionFetched) {
      ethersContract?.on("voteStarted", async (data) => {
        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          ballotAddressToFetch,
          Voting.abi,
          provider
        );

        await updateElectionState(ethersContract);
        console.log("Vote started: ", data);
      });
      ethersContract?.on("voteDone", async (voterAddress) => {
        var strEventAddress = voterAddress.toString().toLowerCase();
        var strAccountAddress = senderAccountAddress.toString().toLowerCase();

        console.log(strEventAddress);
        console.log(strAccountAddress);
        console.log(strEventAddress.valueOf() == strAccountAddress.valueOf());

        if (strEventAddress.valueOf() == strAccountAddress.valueOf()) {
          const provider = new ethers.providers.Web3Provider(
            Web3.givenProvider
          );

          const ethersContract = new ethers.Contract(
            ballotAddressToFetch,
            Voting.abi,
            provider
          );

          await updateElectionState(ethersContract);
        }
      });
      ethersContract?.on("voteEnded", async (data) => {
        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          ballotAddressToFetch,
          Voting.abi,
          provider
        );

        await updateElectionState(ethersContract);
        await updateFinalResult(ethersContract);

        console.log("Vote ended: ", data);
      });

      return () => {
        ethersContract?.removeAllListeners();
      };
    }
  }, [electionFetched]);

  const onOptionChoose = (choice: boolean) => async () => {
    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      ballotAddressToFetch,
      Voting.abi,
      signer
    );

    const transaction = await contract.doVote(choice);

    await transaction.wait();
  };

  const onJoinElectionClick = async () => {
    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

    console.log("Ballot address: ", ballotAddressToFetch);
    const ethersContract = new ethers.Contract(
      ballotAddressToFetch,
      Voting.abi,
      provider
    );

    const accountAddress = Web3.givenProvider.selectedAddress;
    setSenderAccountAddress(accountAddress);
    setEthersContract(ethersContract);

    await updateBallotProposal(ethersContract);
    await updateBallotOfficialName(ethersContract);
    await updateFinalResult(ethersContract);
    await updateElectionState(ethersContract);

    setElectionFetched(true);
  };

  const updateElectionState = async (ballot: Contract) => {
    const newState = await ballot.state();

    setElectionState(
      parseInt(newState) === 0
        ? "Created"
        : parseInt(newState) === 1
        ? "Voting"
        : "Ended"
    );

    await loadVoter(ballot, senderAccountAddress, parseInt(newState));

    // console.log("State: ", newState);
  };

  const loadVoter = async (
    ballot: Contract,
    voterAddress: string,
    state: any
  ) => {
    const voter = await ballot.voterRegister(voterAddress);

    if (voter.voterName !== "" && state == 1) {
      setVoterName(voter.voterName);

      setVoted(voter.voted);
    } else {
      setElectionOver(true);
    }
  };

  const updateFinalResult = async (ballot: Contract) => {
    const finalResult = await ballot.finalResult();

    setResult(parseInt(finalResult));

    // console.log("Final result: ", parseInt(finalResult));
  };

  const updateBallotProposal = async (ballot: Contract) => {
    const newProposal = await ballot.proposal();

    setProposal(newProposal);

    // console.log("Proposal: ", newProposal);
  };

  const updateBallotOfficialName = async (ballot: Contract) => {
    const newBallotName = await ballot.ballotOfficialName();

    setBallotName(newBallotName);

    // console.log("Ballot name: ", newBallotName);
  };

  const onBallotAddressToFetch = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setBallotAddressToFetch(e.target.value);

  return (
    <BallotManagerRoot>
      <BMCenterSection>
        {electionFetched || loadingA ? null : (
          <>
            <BMTitle>Vote</BMTitle>
            <NewBallotContainer>
              <NewBallotContract>Ballot contract</NewBallotContract>
              <BallotDetailsContainer>
                <StyledMUITextField
                  id="outline-basic"
                  label={"Ballot address"}
                  variant="outlined"
                  value={ballotAddressToFetch}
                  onChange={onBallotAddressToFetch}
                />

                <StyledMUIButton
                  variant="contained"
                  onClick={onJoinElectionClick}
                >
                  Join election
                </StyledMUIButton>
              </BallotDetailsContainer>
            </NewBallotContainer>
          </>
        )}

        {loadingA ? (
          <CircularProgress size={"60px"} sx={{ alignSelf: "center" }} />
        ) : null}
        {/* {clicked && !electionFetched ? (
          <CircularProgress
            sx={{ marginTop: "10px", alignSelf: "center" }}
            size={"60px"}
          />
        ) : null} */}

        {!electionFetched ? null : (
          <ContractDetails voter>
            <NewBallotContract>Contract Details</NewBallotContract>
            <SpanLines withButton>
              <div style={{ display: "flex" }}>
                <p>Election state: </p>
                <p>{electionState}</p>
              </div>
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
              <p>Result: </p>
              <p>{result}</p>
            </SpanLines>

            <SpanLines doVote>
              <p>Your name: </p>
              <p>{voterName}</p>
            </SpanLines>

            <SpanLines>
              <p>Your vote </p>
            </SpanLines>
            {electionOver || voted ? (
              <SpanLines>
                <p>{voted}</p>
              </SpanLines>
            ) : (
              <div
                style={{ width: "100%", display: "flex", flexDirection: "row" }}
              >
                <StyledMUIButton
                  color="success"
                  variant="contained"
                  onClick={onOptionChoose(true)}
                >
                  Yes
                </StyledMUIButton>
                <StyledMUIButton
                  color="error"
                  variant="contained"
                  onClick={onOptionChoose(false)}
                  sx={{ marginLeft: "10px" }}
                >
                  No
                </StyledMUIButton>
              </div>
            )}
          </ContractDetails>
        )}

        {/* } */}
      </BMCenterSection>
    </BallotManagerRoot>
  );
};
