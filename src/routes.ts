import React from "react";
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
] as IRoutes[];
