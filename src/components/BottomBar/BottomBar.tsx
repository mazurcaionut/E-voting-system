import React, { useState } from "react";
import {
  BottomBarRoot,
  BottomRightSpan,
  MiddleBar,
  RightSideTexts,
  SocialMediaIconsContainer,
  TitleBotom,
} from "./BottomBar.styles";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedinIcon from "@mui/icons-material/LinkedIn";

export const BottomBar = () => {
  //   const [item, setItem] = useState(0);

  return (
    <BottomBarRoot>
      <TitleBotom>Support</TitleBotom>
      <SocialMediaIconsContainer>
        <FacebookIcon
          fontSize="large"
          sx={{ cursor: "pointer", marginRight: "10px" }}
        />
        <TwitterIcon
          fontSize="large"
          sx={{ cursor: "pointer", marginRight: "10px" }}
        />
        <LinkedinIcon
          fontSize="large"
          sx={{ cursor: "pointer", marginRight: "10px" }}
        />
        <InstagramIcon fontSize="large" sx={{ cursor: "pointer" }} />
      </SocialMediaIconsContainer>
      <BottomRightSpan>
        <RightSideTexts>Terms of Service</RightSideTexts>
        <MiddleBar>|</MiddleBar>
        <RightSideTexts>Privacy policy</RightSideTexts>
      </BottomRightSpan>
    </BottomBarRoot>
  );
};
