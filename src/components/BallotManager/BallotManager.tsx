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
  const [ethersContract, setEthersContract] = useState<Contract | null>(null);
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

  useEffect(() => {
    if (deployed) {
      ethersContract?.on("voterAdded", async (voterAddress) => {
        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          ballotContractAddress,
          Voting.abi,
          provider
        );

        await updateTotalVoters(ethersContract);
        await loadVoter(ethersContract, voterAddress);

        console.log("Added voter: ", voterAddress);
      });
      ethersContract?.on("voteStarted", async (data) => {
        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          ballotContractAddress,
          Voting.abi,
          provider
        );

        await updateElectionState(ethersContract);
        console.log("Vote started: ", data);
      });
      ethersContract?.on("voteEnded", async (data) => {
        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          ballotContractAddress,
          Voting.abi,
          provider
        );

        await updateElectionState(ethersContract);
        await updateFinalResult(ethersContract);

        console.log("Vote ended: ", data);
      });
      ethersContract?.on("voteDone", async (voterAddress) => {
        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          ballotContractAddress,
          Voting.abi,
          provider
        );

        await updateTotalVotes(ethersContract);

        setVotersArray((votersArray) =>
          votersArray.map((m) => ({
            ...m,
            status: m.address == voterAddress ? "Voted" : m.status,
          }))
        );

        console.log("Vote done by: ", voterAddress);
      });

      return () => {
        ethersContract?.removeAllListeners();
      };
    }
  }, [deployed]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.2 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "status", headerName: "Status", flex: 0.5 },
  ] as GridColDef[];

  const loadVoter = async (ballot: Contract, voterAddress: string) => {
    const voter = await ballot.voterRegister(voterAddress);

    setVotersArray((votersArray) => [
      ...votersArray,
      {
        id: (votersArray.length + 1).toString(),
        address: voterAddress,
        name: voter.voterName,
        status: voter.voted ? "Voted" : "Not Voted",
      },
    ]);

    console.log("Voter: ", voter);
  };

  const updateBallotOfficialName = async (ballot: Contract) => {
    const newBallotName = await ballot.ballotOfficialName();

    setBallotName(newBallotName);

    console.log("Ballot name: ", newBallotName);
  };

  const updateBallotProposal = async (ballot: Contract) => {
    const newProposal = await ballot.proposal();

    setProposal(newProposal);

    console.log("Proposal: ", newProposal);
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

    console.log("State: ", newState);
  };

  const updateFinalResult = async (ballot: Contract) => {
    const finalResult = await ballot.finalResult();

    setResult(parseInt(finalResult));

    console.log("Final result: ", parseInt(finalResult));
  };

  const updateTotalVoters = async (ballot: Contract) => {
    const totalVoters = await ballot.totalVoter();

    setVotersNumber(parseInt(totalVoters));

    console.log("Total voters: ", parseInt(totalVoters));
  };

  const updateTotalVotes = async (ballot: Contract) => {
    const totalVotes = await ballot.totalVote();

    setVotes(parseInt(totalVotes));

    console.log("Total votes: ", parseInt(totalVotes));
  };

  const onEndVoting = async () => {
    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      ballotContractAddress,
      Voting.abi,
      signer
    );

    const transaction = await contract.endVote();

    await transaction.wait();
  };

  const onAddVoterClick = async () => {
    if (newVoterAddress === "" || newVoterName === "") {
      return;
    }

    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      ballotContractAddress,
      Voting.abi,
      signer
    );

    const transaction = await contract.addVoter(newVoterAddress, newVoterName);

    await transaction.wait();
  };

  const onStartVoting = async () => {
    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      ballotContractAddress,
      Voting.abi,
      signer
    );

    const transaction = await contract.startVote();

    await transaction.wait();
  };

  const onDeployClick = async () => {
    setClicked(true);
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    let initialBallotContract = new web3.eth.Contract(Voting.abi as AbiItem[]);
    const accountAddress = web3.givenProvider.selectedAddress;

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

        const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

        const ethersContract = new ethers.Contract(
          receipt.contractAddress as string,
          Voting.abi,
          provider
        );

        setEthersContract(ethersContract);

        await updateBallotOfficialName(ethersContract);
        await updateBallotProposal(ethersContract);
        await updateElectionState(ethersContract);
        await updateFinalResult(ethersContract);
        await updateTotalVoters(ethersContract);
        await updateTotalVotes(ethersContract);

        setDeployed(true);
        setClicked(false);
      });
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
      <BMCenterSection ballotManager>
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
