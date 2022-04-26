import { publicRoutes } from "../../routes";
import { BottomBar } from "../BottomBar/BottomBar";
import { TopBar } from "../TopBar/TopBar";
import { NoMatch, TopWrapperComponentRoot } from "./TopWrapperComponent.styles";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import styled, { css } from "styled-components";

export const MiddleContent = styled.div(
  ({ theme }) => css`
    flex: 1;
    display: flex;
  `
);

export const TopWrapperComponent = () => {
  return (
    <TopWrapperComponentRoot>
      <TopBar />

      <MiddleContent>
        <Switch>
          {publicRoutes.map(({ component, path }, index) => (
            <Route exact key={index + 1} path={path} component={component} />
          ))}
          <Route component={NoMatch} />
        </Switch>
      </MiddleContent>

      <BottomBar />
    </TopWrapperComponentRoot>
  );
};
