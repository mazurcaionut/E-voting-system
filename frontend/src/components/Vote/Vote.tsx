import { CircularProgress } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useETHAccount } from "../../customHooks/useETHAccount";
import Voting from "../../artifacts/contracts/BallotImproved.sol/BallotImproved.json";
import {
  BallotDetailsContainer,
  BallotManagerRoot,
  BMCenterSection,
  BMTitle,
  ContractDetails,
  NewBallotContainer,
  NewBallotContract,
  OptionButtonsContainer,
  SpanLines,
  StyledMUIButton,
  StyledMUITextField,
} from "../BallotManager/BallotManager.styles";
import Web3 from "web3";
import { Contract, ethers } from "ethers";
import { OptionsWithResults } from "../BallotManager/BallotManager";
import { password1, password2 } from "../../passwords";

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
  const [options, setOptions] = useState<OptionsWithResults[]>([]);

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

  const onOptionChoose = (choice: string) => async () => {
    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      ballotAddressToFetch,
      Voting.abi,
      signer
    );

    const encodedOption = web3.utils.sha3(
      web3.eth.abi.encodeParameters(
        ["string"],
        [password1.concat(choice, password2)]
      )
    );

    const transaction = await contract.doVote(encodedOption);

    await transaction.wait();
  };

  const updateOptions = async (ballot: Contract) => {
    console.log("Gets in here");
    // const ballotOptions = await ballot.options(0);
    const optionsLength = await ballot.optionsLength();

    const optionsArray = await Promise.all(
      Array.from(Array(parseInt(optionsLength)).keys()).map(async (item) => {
        const currentBallotOption = await ballot.options(item);
        return {
          option: currentBallotOption,
          score: 0,
        };
      })
    );

    setOptions(optionsArray);
  };

  const onJoinElectionClick = async () => {
    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

    console.log("Ballot address: ", ballotAddressToFetch);
    // const signer = provider.getSigner();

    if (ballotAddressToFetch === "" || !ballotAddressToFetch) {
      return;
    }

    try {
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
      await updateOptions(ethersContract);

      setElectionFetched(true);
    } catch (error) {
      console.error("\n\nError is this", error);
      // console.log("There is something totally wrong");
    }
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

    const finalOutput = await Promise.all(
      options.map(async (option, index) => {
        const currentFinalScore = await ballot.finalResults(index);

        return {
          ...option,
          score: parseInt(currentFinalScore),
        };
      })
    );
    // options.map

    setOptions(finalOutput);

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

            {/* <SpanLines>
              <p>Result: </p>
              <p>{result}</p>
            </SpanLines> */}

            <SpanLines style={{ alignItems: "center" }}>
              <p>Result: </p>
              {/* <p>{result}</p> */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {options.map((item) => (
                  <SpanLines>
                    <p>{item.option}</p>
                    <p>{item.score}</p>
                  </SpanLines>
                ))}
              </div>
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
              <OptionButtonsContainer>
                {options.map((item) => (
                  <StyledMUIButton
                    variant="contained"
                    onClick={onOptionChoose(item.option)}
                    color={
                      item.option === "Yes"
                        ? "success"
                        : item.option === "No"
                        ? "error"
                        : "primary"
                    }
                  >
                    {item.option}
                  </StyledMUIButton>
                ))}
              </OptionButtonsContainer>
            )}
          </ContractDetails>
        )}

        {/* } */}
      </BMCenterSection>
    </BallotManagerRoot>
  );
};
