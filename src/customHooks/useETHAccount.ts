import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider } from "@ethersproject/providers";
import { useHistory } from "react-router-dom";

export const useETHAccount = () => {
  const [, setErrorA] = useState(null);
  const [loadingA, setLoadingA] = useState(true);
  const history = useHistory();

  const enableMetamask = async () => {
    try {
      setLoadingA(true);
      const ethereum = (await detectEthereumProvider()) as ExternalProvider;

      if (!ethereum) {
        console.log("TEST");

        history.push("/noMetamaskInstalled");
      }

      if (ethereum.isMetaMask) {
        await ethereum.request?.({ method: "eth_requestAccounts" });
      } else {
        setLoadingA(true);
        return;
      }
    } catch (e: any) {
      setErrorA(e);
    } finally {
      setLoadingA(false);
    }
  };

  useEffect(() => {
    enableMetamask();
  }, []);

  return {
    loadingA,
  };
};
