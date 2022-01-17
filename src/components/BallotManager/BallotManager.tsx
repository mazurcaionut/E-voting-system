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
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useETHAccount } from "../../customHooks/useETHAccount";
import Voting from "../../artifacts/contracts/Voting.sol/Ballot.json";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import Web3 from "web3";
import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { SearchOutlined } from "@mui/icons-material";

interface IBallotManagerProps {
  voter?: boolean;
}

export const BallotManager = (props: IBallotManagerProps) => {
  const [ballotName, setBallotName] = useState("Chairman");
  const [proposal, setProposal] = useState("Should we re-elect Jack?");
  const { loadingA } = useETHAccount();
  const [ballotContract, setBallotContract] = useState<any | null>(null);
  const [senderAccountAddress, setSenderAccountAddress] = useState("");
  const [ballotContractAddress, setBallotContractAddress] = useState("");
  const [newVoterAddres, setNewVoterAddress] = useState("");
  const [newVoterName, setNewVoterName] = useState("");
  const [electionState, setElectionState] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [result, setResult] = useState(0);
  const [votersNumber, setVotersNumber] = useState(0);
  const [votes, setVotes] = useState(0);
  const [pageSizeOption, setPageSizeOption] = useState(5);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.2 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "status", headerName: "Status", flex: 0.5 },
  ] as GridColDef[];

  const rows = [
    { id: 1, address: "a", name: "ddd", status: "55" },
    { id: 2, address: "a", name: "ddd", status: "55" },
    { id: 3, address: "a", name: "ddd", status: "55" },
    { id: 4, address: "a", name: "ddd", status: "55" },
    { id: 5, address: "a", name: "ddd", status: "55" },
    { id: 6, address: "a", name: "ddd", status: "55" },
    { id: 7, address: "a", name: "ddd", status: "55" },
    { id: 8, address: "a", name: "ddd", status: "55" },
  ];

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

  const onDeployClick = async () => {
    setClicked(true);
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    // if (window.ethereum) {
    // }
    // const web3 = new Web3();
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
          console.log("Transaction hash: ", transactionHash);
        }
      )
      .on("error", (error) => {
        console.log("b");
      })
      .on("transactionHash", (transactionHash) => {
        console.log("c");
      })
      .on("receipt", async (receipt) => {
        console.log("Finally deployed");
        console.log("Contract address: ", receipt.contractAddress);

        setBallotContractAddress(receipt.contractAddress as string);

        const deployedContract = new web3.eth.Contract(
          Voting.abi as AbiItem[],
          receipt.contractAddress
        );

        setBallotContract(deployedContract);

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
    if (newVoterAddres === "" || newVoterName === "") {
      return;
    }

    let mygas = 0;

    await ballotContract.methods
      .addVoter(newVoterAddres, newVoterName)
      .estimateGas({ from: senderAccountAddress })
      .then((gasAmount: any) => {
        mygas = gasAmount;
      });

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const gasPrice = await web3.eth.getGasPrice();

    await ballotContract.methods
      .addVoter(newVoterAddres, newVoterName)
      .send({
        from: senderAccountAddress,
        gas: mygas,
        gasPrice: gasPrice,
      })
      .on("transactionHash", (hash: any) => {
        console.log("a");
      })
      .on("receipt", (receipt: any) => {
        console.log("b");
      })
      .on("confirmation", (confirmationNumber: any, receipt: any) => {
        console.log("c");
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
        {deployed || clicked ? null : (
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
                {loadingA ? <CircularProgress /> : null}
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
                <SpanLines withButton>
                  <div style={{ display: "flex" }}>
                    <p>Election state: </p>
                    <p>{electionState}</p>
                  </div>
                  <StyledMUIButton small variant="contained" onClick={() => {}}>
                    Start Voting
                  </StyledMUIButton>
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
              <AddVoterFlex>
                <TextField
                  label="Voter Wallet Address"
                  id="outlined-start-adornment"
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"></InputAdornment>
                    ),
                  }}
                />
              </AddVoterFlex>
              <StyledMUIButton variant="contained" onClick={onAddVoterClick}>
                Add voter
              </StyledMUIButton>
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
                  rows={rows}
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
