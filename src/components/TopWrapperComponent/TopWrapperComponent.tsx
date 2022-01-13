import { publicRoutes } from "../../routes";
import { BottomBar } from "../BottomBar/BottomBar";
import { TopBar } from "../TopBar/TopBar";
import { NoMatch, TopWrapperComponentRoot } from "./TopWrapperComponent.styles";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

export const TopWrapperComponent = () => {
  return (
    <TopWrapperComponentRoot>
      <TopBar />

      <div style={{ flex: 1, display: "flex" }}>
        <Switch>
          {publicRoutes.map(({ component, path }, index) => (
            <Route exact key={index + 1} path={path} component={component} />
          ))}
          <Route component={NoMatch} />
        </Switch>
      </div>

      <BottomBar />
    </TopWrapperComponentRoot>
  );
};
