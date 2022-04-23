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
// import Voting from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import Voting from "../../artifacts/contracts/BallotImproved.sol/BallotImproved.json";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import Web3 from "web3";
import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { SearchOutlined } from "@mui/icons-material";
import { Contract, ethers } from "ethers";
import { password1, password2 } from "../../passwords";

interface IBallotManagerProps {
  voter?: boolean;
}

interface IVoter {
  id: string;
  address: string;
  name: string;
  status: string;
}

type IElection = "none" | "Referendum" | "Candidates";

export interface OptionsWithResults {
  option: string;
  score: number;
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
  const [electionType, setElectionType] = useState<IElection>("none");
  const [options, setOptions] = useState<OptionsWithResults[]>([]);

  useEffect(() => {
    if (deployed) {
      ethersContract?.on("wrongHash", async (data) => {
        console.log("Hash is not correct");
      });

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

    setVotersArray((votersArray) =>
      votersArray.some((arrayVoter) => arrayVoter.address === voterAddress)
        ? votersArray.map((arrayVoter) =>
            arrayVoter.address === voterAddress
              ? {
                  ...arrayVoter,
                  name: voter.voterName,
                }
              : arrayVoter
          )
        : [
            ...votersArray,
            {
              id: (votersArray.length + 1).toString(),
              address: voterAddress,
              name: voter.voterName,
              status: voter.voted ? "Voted" : "Not Voted",
            },
          ]
    );

    console.log("Voter: ", voter);
  };

  const updateOptions = async (ballot: Contract) => {
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

    const transaction = await contract.endVote(password1, password2);

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

    try {
      const transaction = await contract.addVoter(
        newVoterAddress,
        newVoterName
      );

      await transaction.wait();
    } catch (error) {
      console.log("It didn't work");
    }
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

    const options =
      electionType === "Referendum" ? ["Yes", "No"] : proposal.split(",");

    const gasPrice = await web3.eth.getGasPrice();
    await initialBallotContract
      .deploy({
        data: Voting.bytecode,
        arguments: [
          ballotName,
          proposal,
          options,
          options.map((item) =>
            web3.utils.sha3(
              web3.eth.abi.encodeParameters(
                ["string"],
                [password1.concat(item, password2)]
              )
            )
          ),
        ],
      })
      .send(
        {
          from: accountAddress,
          // gas: 1308700,
          // gas: 1204553,
          gas: 6000000,
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
        await updateOptions(ethersContract);

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

  const testWeb3 = async () => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const provider = new ethers.providers.Web3Provider(Web3.givenProvider);

    const ethersContract = new ethers.Contract(
      ballotContractAddress,
      Voting.abi,
      provider
    );

    const ballotOptions = await ethersContract.options(0);
    const optionsLength = await ethersContract.optionsLength();
    // const ballotOptions = await ethersContract.ballotOfficialName();
    // const newProposal = await ethersContract.proposal();

    // await Promise.all()
    console.log("\n\nOptions: ", ballotOptions, "\n\n");
    console.log("\n\nOptions length: ", parseInt(optionsLength), "\n\n");

    // console.log(
    //   "Test items: ",
    //   web3.eth.getStorageAt(ballotContractAddress, 7).then((result) => {
    //     console.log("\n\nResult: ", result);
    //     console.log(web3.utils.hexToAscii(result));
    //   })
    // );

    // const storageIndex = 0;
    // const key = web3.utils.keccak256("0".concat("1"));

    // const index =
    //   "0000000000000000000000000000000000000000000000000000000000000006";
    // const key =
    //   "000000000000000000000000000000000000000000000000000000000000000";

    // web3.eth.abi

    // web3.utils.soliditySha3
    // const storage = web3.utils.keccak256(
    //   key + index
    //   // key + index,
    //   // { encoding: "hex" }
    //   // { type: "uint", value: "0" }
    // );

    // console.log(
    //   "\n\nTest private: ",
    //   // storage
    //   web3.eth.getStorageAt(ballotContractAddress, 0).then((result) => {
    //     console.log(web3.utils.hexToAscii(result));
    //     console.log("\n\nResult: ", result);
    //   })
    // );
  };

  return (
    <BallotManagerRoot>
      <BMCenterSection ballotManager>
        {deployed || clicked || loadingA ? null : (
          <>
            <BMTitle>{props.voter ? `Vote` : `Ballot Manager`}</BMTitle>
            <NewBallotContainer>
              {electionType === "none" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div>Pick the type of election that you want</div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <StyledMUIButton
                      onClick={() => setElectionType("Referendum")}
                      variant="contained"
                    >
                      Referendum
                    </StyledMUIButton>
                    <StyledMUIButton
                      onClick={() => setElectionType("Candidates")}
                      variant="contained"
                    >
                      Candidates election
                    </StyledMUIButton>
                  </div>
                </div>
              ) : electionType === "Referendum" ? (
                <>
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
                      <>
                        <StyledMUITextField
                          id="outline-basic"
                          label="Proposal"
                          variant="outlined"
                          value={proposal}
                          onChange={onProposalChange}
                        />
                      </>
                    )}

                    <StyledMUIButton
                      variant="contained"
                      onClick={onDeployClick}
                    >
                      Deploy
                    </StyledMUIButton>
                  </BallotDetailsContainer>
                </>
              ) : (
                <>
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
                      <>
                        <StyledMUITextField
                          id="outline-basic"
                          label="Candidates list (add a coma between them)"
                          variant="outlined"
                          value={proposal}
                          onChange={onProposalChange}
                        />
                      </>
                    )}

                    <StyledMUIButton
                      variant="contained"
                      onClick={onDeployClick}
                    >
                      Deploy
                    </StyledMUIButton>
                  </BallotDetailsContainer>
                </>
              )}
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
                <StyledMUIButton small variant="contained" onClick={testWeb3}>
                  Test web3
                </StyledMUIButton>
                <NewBallotContract>Vote Details</NewBallotContract>
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
