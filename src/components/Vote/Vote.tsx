import { CircularProgress } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useETHAccount } from "../../customHooks/useETHAccount";
import { BallotManager } from "../BallotManager/BallotManager";
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
import { AbiItem } from "web3-utils";

export const Vote = () => {
  const { loadingA } = useETHAccount();
  const [electionFetched, setElectionFetched] = useState(false);
  const [ballotAddressToFetch, setBallotAddressToFetch] = useState("");
  const [senderAccountAddress, setSenderAccountAddress] = useState("");
  const [ballotName, setBallotName] = useState("");
  const [proposal, setProposal] = useState("");
  const [result, setResult] = useState(0);
  const [ballotContract, setBallotContract] = useState<any | null>(null);
  const [electionState, setElectionState] = useState("");
  const [voted, setVoted] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [electionOver, setElectionOver] = useState(false);

  useEffect(() => {
    if (electionFetched) {
      onWatchVoteEnd();
      onWatchVoteDone();
      onWatchVoteStarted();
    }
  }, [electionFetched]);

  const onWatchVoteEnd = () => {
    ballotContract.events
      .voteEnded(
        {},
        async (error: any, event: { returnValues: { finalResult: any } }) => {
          console.log(event.returnValues.finalResult);

          await updateFinalResult(ballotContract);
          await updateElectionState(ballotContract);
        }
      )
      .on("data", (event: any) => {})
      .on("changed", (event: any) => {
        // remove event from local database
      })
      .on("error", console.error);
  };

  const onWatchVoteStarted = () => {
    ballotContract.events
      .voteStarted({}, async (error: any, event: any) => {
        console.log(event.event); // same results as the optional callback above
        await updateElectionState(ballotContract);
      })
      .on("data", (event: { event: any }) => {})
      .on("changed", (event: any) => {
        // remove event from local database
      })
      .on("error", console.error);
  };

  const onWatchVoteDone = () => {
    ballotContract.events
      .voteDone(
        {},
        async (
          error: any,
          event: { returnValues: { voter: { toString: () => string } } }
        ) => {
          var strEventAddress = event.returnValues.voter
            .toString()
            .toLowerCase();
          var strAccountAddress = senderAccountAddress.toString().toLowerCase();

          console.log(strEventAddress);
          console.log(strAccountAddress);
          console.log(strEventAddress.valueOf() == strAccountAddress.valueOf());

          if (strEventAddress.valueOf() == strAccountAddress.valueOf()) {
            await updateElectionState(ballotContract);
          }
        }
      )
      .on("data", (event: any) => {})
      .on("changed", (event: any) => {
        // remove event from local database
      })
      .on("error", console.error);
  };

  const onOptionChoose = (choice: boolean) => async () => {
    let mygas = 0;

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const gasPrice = await web3.eth.getGasPrice();

    await ballotContract?.methods
      .doVote(choice)
      .estimateGas({ from: senderAccountAddress })
      .then((gasAmount: any) => {
        mygas = gasAmount;
      });

    await ballotContract.methods
      .doVote(choice)
      .send({
        from: senderAccountAddress,
        gas: mygas,
        gasPrice: gasPrice,
      })
      .on("transactionHash", (hash: any) => {
        console.log("a");
      })
      .on("receipt", (receipt: any) => {
        console.log("done");
      })
      .on("confirmation", (confirmationNumber: any, receipt: any) => {
        console.log("c");
      })
      .on("error", console.error);
  };

  const onJoinElectionClick = async () => {
    console.log("It works bro");

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const deployedContract = new web3.eth.Contract(
      Voting.abi as AbiItem[],
      ballotAddressToFetch
    );

    const accountAddress = web3.givenProvider.selectedAddress;
    setSenderAccountAddress(accountAddress);

    setBallotContract(deployedContract);

    await updateBallotProposal(deployedContract);
    await updateBallotOfficialName(deployedContract);
    await updateFinalResult(deployedContract);
    await updateElectionState(deployedContract);

    setElectionFetched(true);
  };

  const updateElectionState = async (ballot: any) =>
    await ballot.methods
      .state()
      .call()
      .then(async (newState: any) => {
        console.log("The new state is : ", newState);

        setElectionState(
          parseInt(newState) === 0
            ? "Created"
            : parseInt(newState) === 1
            ? "Voting"
            : "Ended"
        );

        await loadVoter(ballot, senderAccountAddress, parseInt(newState));
      });

  const loadVoter = async (ballot: any, voterAddress: string, state: any) =>
    await ballotContract.methods
      .voterRegister(voterAddress)
      .call()
      .then((result: { voted: any; voterName: any }) => {
        if (result.voterName != "" && state == 1) {
          // $("#loaderChoice").hide();
          // $("#section_voting").show();

          // $("#lbl_voter").html("<b>Your Name: </b>" + result.voterName);
          setVoterName(result.voterName);

          console.log(result.voted);

          setVoted(result.voted);

          // if (result.voted) {
          //   $("#btnYes").hide();
          //   $("#btnNo").hide();
          //   $("#lblVoted").html(
          //     "<span class='label label-primary'>Voted</span>"
          //   );
          // } else {
          //   $("#btnYes").show();
          //   $("#btnNo").show();
          // }
        } else {
          setElectionOver(true);
        }
      });

  const updateFinalResult = async (ballot: any) =>
    await ballot.methods
      .finalResult()
      .call()
      .then((finalResult: number) => {
        setResult(finalResult);
      });

  const updateBallotProposal = async (ballot: any) =>
    await ballot.methods
      .proposal()
      .call()
      .then((newProposal: string) => {
        setProposal(newProposal);
      });

  const updateBallotOfficialName = async (ballot: any) =>
    await ballot.methods
      .ballotOfficialName()
      .call()
      .then((newBallotName: string) => {
        setBallotName(newBallotName);
      });

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
