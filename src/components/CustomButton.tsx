import React from "react";
import styled, { css } from "styled-components";

export const StyledButton = styled.button(
  ({ theme }) => css`
    color: black;
    font-size: 30px;
    width: fit-content;
    white-space: nowrap;
    cursor: pointer;
    text-align: center;
    height: 200px;
    background-color: yellow;
    border: 20px solid blue;
  `
);

export const CustomButton = () => {
  return <StyledButton>Fetch greeting</StyledButton>;
};
