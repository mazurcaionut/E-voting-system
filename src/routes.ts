import React from "react";
import { BallotManager } from "./components/BallotManager/BallotManager";
import { Vote } from "./components/Vote/Vote";
import { WelcomePage } from "./components/WelcomePage/WelcomePage";

interface IRoutes {
  component: React.ComponentType<any>;
  path: string;
}

export const publicRoutes = [
  {
    component: WelcomePage,
    path: "/",
  },
  {
    component: BallotManager,
    path: "/ballotManager",
  },
  {
    component: Vote,
    path: "/vote",
  },
] as IRoutes[];
