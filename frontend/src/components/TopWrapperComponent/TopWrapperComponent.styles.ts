import styled, { css } from "styled-components";

export const TopWrapperComponentRoot = styled.div(
  ({ theme }) => css`
    height: 100vh;
    width: 100vw;
    font-size: large;
    display: flex;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif !important;
    flex-direction: column;
  `
);

export const NoMatch = styled.div(
  ({ theme }) => css`
    background: url("https://i.stack.imgur.com/6M513.png") no-repeat center
      center fixed;
    background-size: cover;
    flex: 1;
  `
);
