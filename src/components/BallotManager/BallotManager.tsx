import {
  BallotDetailsContainer,
  BallotManagerRoot,
  BMCenterSection,
  BMTitle,
  NewBallotContainer,
  NewBallotContract,
  StyledMUIButton,
  StyledMUITextField,
  StyledTextField,
} from "./BallotManager.styles";
import { Button, TextField } from "@mui/material";
import React, { ChangeEvent, useState } from "react";

interface IBallotManagerProps {
  voter?: boolean;
}

export const BallotManager = (props: IBallotManagerProps) => {
  const [ballotName, setBallotName] = useState("");
  const [proposal, setProposal] = useState("Should we re-elect Jack?");

  const onBallotNameChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setBallotName(e.target.value);

  const onProposalChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => setProposal(e.target.value);

  return (
    <BallotManagerRoot>
      <BMCenterSection>
        <BMTitle>{props.voter ? `Vote` : `Ballot Manager`}</BMTitle>
        <NewBallotContainer>
          <NewBallotContract>
            {props.voter ? `Ballot contract` : `New Ballot Contract`}
          </NewBallotContract>
          <BallotDetailsContainer>
            <StyledMUITextField
              id="outline-basic"
              label="Ballot Address"
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

            <StyledMUIButton variant="contained">Go</StyledMUIButton>
            {/* <Button
              variant="contained"
              sx={{ width: "100px", fontSize: "30px", height: "50px" }}
            >
              Go
            </Button> */}
          </BallotDetailsContainer>
        </NewBallotContainer>
      </BMCenterSection>
    </BallotManagerRoot>
  );
};
