import styled, { css } from "styled-components";

export const BottomBarRoot = styled.div(
  ({ theme }) => css`
    width: 100%;
    min-height: 100px;
    background-color: black;
    text-align: left;
    color: white;
  `
);

export const TitleBotom = styled.p(
  ({ theme }) => css`
    margin: 20px;
    font-style: italic;
    font-size: 50px;
  `
);
