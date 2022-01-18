import styled, { css } from "styled-components";

export const BottomBarRoot = styled.div(
  ({ theme }) => css`
    width: 100%;
    min-height: 50px;
    background-color: black;
    text-align: left;
    display: flex;
    justify-content: space-between;
    color: white;
  `
);

export const TitleBotom = styled.p(
  ({ theme }) => css`
    margin: 20px;
    /* font-style: italic; */
    font-size: 20px;

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `
);

export const SocialMediaIconsContainer = styled.span(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    height: 100%;
    align-items: center;
  `
);

export const BottomRightSpan = styled.span(
  ({ theme }) => css`
    /* margin: 20px; */
    margin-right: 15px;
    font-size: 20px;
    display: flex;
    flex-direction: row;
  `
);

export const MiddleBar = styled.p(
  ({ theme }) => css`
    font-size: 20px;
    margin-right: 5px;
    margin-left: 5px;
  `
);

export const RightSideTexts = styled.p(
  ({ theme }) => css`
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `
);

// export const TitleBotom = styled.p(
//   ({ theme }) => css`
//     margin: 20px;
//     /* font-style: italic; */
//     font-size: 20px;

//     &:hover {
//       text-decoration: underline;
//       cursor: pointer;
//     }
//   `
// );
