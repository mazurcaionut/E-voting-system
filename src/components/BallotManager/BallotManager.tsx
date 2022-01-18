import {
  AddVoterFlex,
  BallotDetailsContainer,
  BallotManagerRoot,
  BMCenterSection,
  BMTitle,
  ContractDetails,
  ElectionMetadata,
  EntriesSpan,
  NewBallotContainer,
  NewBallotContract,
  SpanLines,
  StyledMUIButton,
  StyledMUITextField,
  StyledTextField,
  TopGridFilter,
  VotersSection,
} from "./BallotManager.styles";
import {
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useETHAccount } from "../../customHooks/useETHAccount";
import Voting from "../../artifacts/contracts/Voting.sol/Ballot.json";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import Web3 from "web3";
import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { SearchOutlined } from "@mui/icons-material";
import { Contract, ethers } from "ethers";

interface IBallotManagerProps {
  voter?: boolean;
}

interface IVoter {
  id: string;
  address: string;
  name: string;
  status: string;
}

export const BallotManager = (props: IBallotManagerProps) => {
  const [ballotName, setBallotName] = useState("");
  const [proposal, setProposal] = useState("");
  const { loadingA } = useETHAccount();
  const [ballotContract, setBallotContract] = useState<any | null>(null);
  const [ethersContract, setEthersContract] = useState<Contract | null>(null);
  const [senderAccountAddress, setSenderAccountAddress] = useState("");
  const [ballotContractAddress, setBallotContractAddress] = useState("");
  const [newVoterAddress, setNewVoterAddress] = useState("");
  const [votersArray, setVotersArray] = useState<IVoter[]>([]);
  const [newVoterName, setNewVoterName] = useState("");
  const [electionState, setElectionState] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [result, setResult] = useState(0);
  const [votersNumber, setVotersNumber] = useState(0);
  const [votes, setVotes] = useState(0);
  const [pageSizeOption, setPageSizeOption] = useState(5);
  const [lastVoterAddress, setLastVoterAddress] = useState(false);

  const onWatchVodeDone = () =>
    ballotContract.events
      .voteDone(
        {},
        async (error: any, event: { returnValues: { voter: any } }) => {
          console.log(event.returnValues.voter);
          // updateNewVote(event.returnValues.voter);

          await updateTotalVotes(ballotContract);

          setVotersArray((votersArray) =>
            votersArray.map((m) => ({
              ...m,
              status:
                m.address == event.returnValues.voter ? "Voted" : m.status,
            }))
          );
        }
      )
      .on("data", (event: any) => {})
      .on("changed", (event: any) => {
        // remove event from local database
      })
      .on("error", console.error);

  const onWatchVoteEnd = () =>
    ballotContract.events
      .voteEnded(
        {},
        async (error: any, event: { returnValues: { finalResult: any } }) => {
          console.log(event.returnValues.finalResult);

          await updateElectionState(ballotContract);
          await updateFinalResult(ballotContract);
        }
      )
      .on("data", (event: any) => {})
      .on("changed", (event: any) => {
        // remove event from local database
      })
      .on("error", console.error);

  const onWatchVoterAdded = () => {
    ballotContract.events
      .voterAdded(
        {},
        async (error: any, event: { returnValues: { voter: any } }) => {
          console.log("Added voter: ", event.returnValues.voter);

          await updateTotalVoters(ballotContract);

          if (lastVoterAddress != event.returnValues.voter) {
            setLastVoterAddress(event.returnValues.voter);
            await loadVoter(event.returnValues.voter);
          }
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
        console.log("State is changing");
        console.log(event.event); // same results as the optional callback above

        await updateElectionState(ballotContract);
      })
      .on("data", (event: any) => {
        // console.log(event.event); // same results as the optional callback above
        // await updateElectionState(ballotContract);
      })
      .on("changed", (event: any) => {
        // remove event from local database
      })
      .on("error", console.error);
  };

  const ethersListenerAdded = useCallback(
    async (event: { returnValues: { voter: any } }) => {
      // handle the click event
      console.log("Added voter: ", event.returnValues.voter);

      await updateTotalVoters(ballotContract);

      if (lastVoterAddress != event.returnValues.voter) {
        setLastVoterAddress(event.returnValues.voter);
        await loadVoter(event.returnValues.voter);
      }
    },
    []
  );

  const ethersListenerStarted = useCallback(async (event: any) => {
    // handle the click event
    console.log("State is changing");
    console.log(event.event); // same results as the optional callback above

    await updateElectionState(ballotContract);
  }, []);

  const ethersListenerDone = useCallback(
    async (event: { returnValues: { voter: any } }) => {
      console.log(event.returnValues.voter);
      // updateNewVote(event.returnValues.voter);

      await updateTotalVotes(ballotContract);

      setVotersArray((votersArray) =>
        votersArray.map((m) => ({
          ...m,
          status: m.address == event.returnValues.voter ? "Voted" : m.status,
        }))
      );
    },
    []
  );

  const ethersListenerEnded = useCallback(
    async (event: { returnValues: { finalResult: any } }) => {
      console.log(event.returnValues.finalResult);

      await updateElectionState(ballotContract);
      await updateFinalResult(ballotContract);
    },
    []
  );

  useEffect(() => {
    if (deployed) {
      // ethersContract?.on("voterAdded", ethersListenerAdded);
      // ethersContract?.on("voteStarted", ethersListenerStarted);
      // ethersContract?.on("voteEnded", ethersListenerEnded);
      // ethersContract?.on("voteDone", ethersListenerDone);
      onWatchVoteEnd();
      onWatchVodeDone();
      onWatchVoterAdded();
      onWatchVoteStarted();

      return () => {
        ethersContract?.removeAllListeners();
      };
      // ballotContract.on("voterAdded", listener);
      // return () => {
      //   ballotContract.off("voterAdded", listener);
      // };
    }
  }, [
    deployed,
    // onWatchVodeDone,
    // onWatchVoteEnd,
    // onWatchVoteStarted,
    // onWatchVoterAdded,
  ]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.2 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "status", headerName: "Status", flex: 0.5 },
  ] as GridColDef[];

  const loadVoter = async (voterAddress: string) =>
    await ballotContract.methods
      .voterRegister(voterAddress)
      .call()
      .then((result: { voted: any; voterName: any }) => {
        console.log(result);

        setVotersArray((votersArray) =>
          votersArray.some((m) => m.address === voterAddress)
            ? votersArray
            : [
                ...votersArray,
                {
                  id: (votersArray.length + 1).toString(),
                  address: voterAddress,
                  name: result.voterName,
                  status: result.voted ? "Voted" : "Not Voted",
                },
              ]
        );
      });

  const updateBallotOfficialName = async (ballot: any) =>
    await ballot.methods
      .ballotOfficialName()
      .call()
      .then((newBallotName: string) => {
        setBallotName(newBallotName);
      });

  const updateBallotProposal = async (ballot: any) =>
    await ballot.methods
      .proposal()
      .call()
      .then((newProposal: string) => {
        setProposal(newProposal);
      });

  const updateElectionState = async (ballot: any) =>
    await ballot.methods
      .state()
      .call()
      .then((newState: any) => {
        console.log("The new state is : ", newState);

        setElectionState(
          parseInt(newState) === 0
            ? "Created"
            : parseInt(newState) === 1
            ? "Voting"
            : "Ended"
        );
      });

  const updateFinalResult = async (ballot: any) =>
    await ballot.methods
      .finalResult()
      .call()
      .then((finalResult: number) => {
        setResult(finalResult);
      });

  const updateTotalVoters = async (ballot: any) =>
    await ballot.methods
      .totalVoter()
      .call()
      .then((totalVoter: number) => {
        setVotersNumber(totalVoter);
      });

  const updateTotalVotes = async (ballot: any) =>
    await ballot.methods
      .totalVote()
      .call()
      .then((totalVote: number) => {
        setVotes(totalVote);
      });

  const onEndVoting = async () => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const gasPrice = await web3.eth.getGasPrice();

    let mygas = 0;

    await ballotContract?.methods
      .endVote()
      .estimateGas({ from: senderAccountAddress })
      .then((gasAmount: any) => {
        mygas = gasAmount;
      });

    ballotContract.methods
      .endVote()
      .send({
        from: senderAccountAddress,
        gas: mygas,
        gasPrice: gasPrice,
      })
      .on("transactionHash", (hash: any) => {
        console.log("Transaction hash for END VOTING");
      })
      .on("receipt", (receipt: any) => {
        console.log("Receipt for END VOTING");
      })
      .on("confirmation", (confirmationNumber: any, receipt: any) => {
        console.log("Confirmation  for END VOTING");
      })
      .on("error", console.error);
  };

  const onStartVoting = async () => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const gasPrice = await web3.eth.getGasPrice();

    let mygas = 0;

    await ballotContract?.methods
      .startVote()
      .estimateGas({ from: senderAccountAddress })
      .then((gasAmount: any) => {
        mygas = gasAmount;
      });

    ballotContract.methods
      .startVote()
      .send({
        from: senderAccountAddress,
        gas: mygas,
        gasPrice: gasPrice,
      })
      .on("transactionHash", (hash: any) => {
        console.log("Transaction hash for START VOTING");
      })
      .on("receipt", (receipt: any) => {
        console.log("Receipt for START VOTING");
      })
      .on("confirmation", (confirmationNumber: any, receipt: any) => {
        console.log("Confirmation for START VOTING");
      })
      .on("error", console.error);
  };

  const onDeployClick = async () => {
    setClicked(true);
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    let initialBallotContract = new web3.eth.Contract(Voting.abi as AbiItem[]);
    const accountAddress = web3.givenProvider.selectedAddress;

    setSenderAccountAddress(accountAddress);

    const gasPrice = await web3.eth.getGasPrice();
    await initialBallotContract
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
          console.log("Transaction hash for deployment: ", transactionHash);
        }
      )
      .on("error", (error) => {
        console.log("Error for deploying");
      })
      .on("transactionHash", (transactionHash) => {
        console.log("transaction hash for deployment again");
      })
      .on("receipt", async (receipt) => {
        console.log("Finally deployed");
        console.log("Contract address: ", receipt.contractAddress);

        setBallotContractAddress(receipt.contractAddress as string);

        const deployedContract = new web3.eth.Contract(
          Voting.abi as AbiItem[],
          receipt.contractAddress as string
        );

        setBallotContract(deployedContract);

        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          receipt.contractAddress as string,
          Voting.abi,
          provider
        );

        setEthersContract(ethersContract);

        await updateBallotOfficialName(deployedContract);
        await updateBallotProposal(deployedContract);
        await updateElectionState(deployedContract);
        await updateFinalResult(deployedContract);
        await updateTotalVoters(deployedContract);
        await updateTotalVotes(deployedContract);

        setDeployed(true);
        setClicked(false);
        // receipt.contractAddress;
      });
    // .on("confirmation", (confirmationNumber, receipt) => {})
    // .then((newContractInstance) => {
    //   console.log(newContractInstance.options.address); // instance with the new contract address
    // });
  };

  const onAddVoterClick = async () => {
    if (newVoterAddress === "" || newVoterName === "") {
      return;
    }

    console.log("GOES HERE");

    let mygas = 0;

    await ballotContract?.methods
      .addVoter(newVoterAddress, newVoterName)
      .estimateGas({ from: senderAccountAddress })
      .then((gasAmount: any) => {
        mygas = gasAmount;
      });

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const gasPrice = await web3.eth.getGasPrice();

    await ballotContract?.methods
      .addVoter(newVoterAddress, newVoterName)
      .send({
        from: senderAccountAddress,
        gas: mygas,
        gasPrice: gasPrice,
      })
      .on("transactionHash", (hash: any) => {
        console.log("Transaction hash for adding voter");
      })
      .on("receipt", (receipt: any) => {
        console.log("Receipt for adding voter");
      })
      .on("confirmation", (confirmationNumber: any, receipt: any) => {
        console.log("Confirmation for adding voter");
      })
      .on("error", console.error);
  };

  const onBallotNameChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setBallotName(e.target.value);

  const onProposalChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setProposal(e.target.value);

  const onEntriesSelect = (e: SelectChangeEvent<string>) =>
    setPageSizeOption(parseInt(e.target.value));

  const onNewVoterAddressChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setNewVoterAddress(e.target.value);

  const onNewVoterNameChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setNewVoterName(e.target.value);

  return (
    <BallotManagerRoot>
      <BMCenterSection>
        {deployed || clicked || loadingA ? null : (
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

                <StyledMUIButton variant="contained" onClick={onDeployClick}>
                  Deploy
                </StyledMUIButton>
              </BallotDetailsContainer>
            </NewBallotContainer>
          </>
        )}

        {loadingA ? (
          <CircularProgress size={"60px"} sx={{ alignSelf: "center" }} />
        ) : null}

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
                <SpanLines withButton>
                  <div style={{ display: "flex" }}>
                    <p>Election state: </p>
                    <p>{electionState}</p>
                  </div>

                  {electionState === "Ended" ? null : (
                    <StyledMUIButton
                      small
                      variant="contained"
                      onClick={
                        electionState === "Created"
                          ? onStartVoting
                          : electionState === "Voting"
                          ? onEndVoting
                          : () => {}
                      }
                    >
                      {electionState === "Created"
                        ? "Start Voting"
                        : "End vote"}
                    </StyledMUIButton>
                  )}
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
                  <p>{result}</p>
                </SpanLines>

                <SpanLines>
                  <p>Voters: </p>
                  <p>{votersNumber}</p>
                </SpanLines>

                <SpanLines>
                  <p>Votes: </p>
                  <p>{votes}</p>
                </SpanLines>
              </ContractDetails>
            </ElectionMetadata>
            <VotersSection>
              <NewBallotContract>Voters section</NewBallotContract>
              {electionState === "Created" ? (
                <AddVoterFlex>
                  <TextField
                    label="Voter Wallet Address"
                    id="outlined-start-adornment"
                    value={newVoterAddress}
                    onChange={onNewVoterAddressChange}
                    sx={{ width: "45%" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"></InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Voter's Name"
                    id="outlined-start-adornment"
                    sx={{ width: "45%" }}
                    value={newVoterName}
                    onChange={onNewVoterNameChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"></InputAdornment>
                      ),
                    }}
                  />
                </AddVoterFlex>
              ) : null}

              {electionState === "Created" ? (
                <StyledMUIButton variant="contained" onClick={onAddVoterClick}>
                  Add voter
                </StyledMUIButton>
              ) : null}

              <TopGridFilter>
                <EntriesSpan>
                  <p>Show</p>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={pageSizeOption.toString()}
                    sx={{ marginLeft: "10px", marginRight: "10px" }}
                    onChange={onEntriesSelect}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                  </Select>
                  <p>Entries</p>
                </EntriesSpan>

                <TextField
                  id="input-with-icon-textfield"
                  label="Search"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  sx={{ alignItems: "flex-end" }}
                />
              </TopGridFilter>
              <div style={{ width: "100%", minHeight: "30px" }}>
                <DataGrid
                  rows={votersArray}
                  autoHeight
                  columns={columns}
                  pageSize={pageSizeOption}
                />
              </div>
            </VotersSection>
          </>
        )}
      </BMCenterSection>
    </BallotManagerRoot>
  );
};
