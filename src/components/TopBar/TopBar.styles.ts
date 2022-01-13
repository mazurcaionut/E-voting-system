import styled, { css } from "styled-components";

export const TopBarRoot = styled.div(
  ({ theme }) => css`
    width: 100%;
    min-height: 100px;
    text-align: left;
    display: flex;
    background-color: black;
    color: white;
  `
);

export const TitleTop = styled.p(
  ({ theme }) => css`
    margin: 20px;
    font-style: italic;
    font-size: 50px;
  `
);
