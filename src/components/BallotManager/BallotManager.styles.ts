import { Button, TextField } from "@mui/material";
import styled, { css } from "styled-components";

export const StyledMUIButton = styled(Button)(
  ({ theme }) => css`
    width: 100px;
    font-size: 30px;
    height: 50px;
  `
);

export const StyledMUITextField = styled(TextField)(
  ({ theme }) => css`
    margin-bottom: 10px;
    margin-top: 10px;

    /* & > label {
      font-size: 20px;
    } */

    /* 
    .label {
      font-size: 20px;
    }

    .input {
      font-size: 20px;
    } */
  `
);

export const BallotManagerRoot = styled.div(
  ({ theme }) => css`
    flex: 1;
    display: flex;
    justify-content: center;
  `
);

export const BMCenterSection = styled.div(
  ({ theme }) => css`
    width: 65%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;
    padding: 15px;
  `
);

export const BMTitle = styled.p(
  ({ theme }) => css`
    font-size: 50px;
    font-style: italic;
    width: 100%;
    text-align: left;
    margin: 0;
    margin-bottom: 10px;
  `
);

export const NewBallotContainer = styled.div(
  ({ theme }) => css`
    border: 5px solid #c0c0c0;
    background-color: #dcdcdc;
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    /* padding: 10px; */
    height: fit-content;
  `
);

export const NewBallotContract = styled.div(
  ({ theme }) => css`
    width: 100%;
    text-align: left;
    font-size: 30px;
    box-sizing: border-box;
  `
);

export const BallotDetailsContainer = styled.div(
  ({ theme }) => css`
    box-sizing: border-box;
    padding: 15px;
    display: flex;
    flex-direction: column;
    width: 100%;
  `
);

export const StyledTextField = styled(TextField)(
  ({ theme }) => css`
    margin-top: 5px;
    margin-bottom: 5px;
  `
);
