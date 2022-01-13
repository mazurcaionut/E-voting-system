import styled, { css } from "styled-components";

export const MiddleContentRoot = styled.div(
  ({ theme }) => css`
    flex: 1;
    position: relative;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  `
);

export const StyledButton = styled.button(
  ({ theme }) => css`
    color: black;
    font-size: 30px;
    /* width: fit-content; */
    width: 300px;
    white-space: nowrap;
    cursor: pointer;
    height: 100px;
    border-radius: 50px;
    text-align: center;
    height: 200px;
    background-color: yellow;
    border: 20px solid black;
    transition: all 0.5s ease;

    &:hover {
      background-color: blue;
      border: 20px solid yellow;
      color: white;
    }
  `
);
export const ButtonsContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    padding: 20px;
    width: 100%;
    justify-content: space-around;
    z-index: 2;
    height: fit-content;
  `
);

export const BackgroundVideo = styled.video(
  ({ theme }) => css`
    object-fit: cover;
    width: 100%;
    height: 100%;
    opacity: 0.4;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
  `
);
