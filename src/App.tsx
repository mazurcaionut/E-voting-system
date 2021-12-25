import { useState } from "react";
import { ethers } from "ethers";
import logo from "./logo.svg";
import "./App.css";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider } from "@ethersproject/providers";
import { CustomButton, StyledButton } from "./components/CustomButton";

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [greeting, setGreetingValue] = useState<string>("");
  const requestAccount = async () => {
    const ethereum = (await detectEthereumProvider()) as ExternalProvider;

    await ethereum.request?.({ method: "eth_requestAccounts" });
  };

  const fetchGreeting = async () => {
    const provider = (await detectEthereumProvider()) as ExternalProvider;

    if (provider.isMetaMask) {
      const ethereumProvider = new ethers.providers.Web3Provider(provider);
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        ethereumProvider
      );
      try {
        const data = await contract.greet();
        console.log("data: ", data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };

  const setGreeting = async () => {
    if (!greeting) return;

    const provider = (await detectEthereumProvider()) as ExternalProvider;

    if (provider.isMetaMask) {
      await requestAccount();
      const ethereumProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethereumProvider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      setGreetingValue("");
      await transaction.wait();
      fetchGreeting();
    }
  };

  return (
    <div className="App">
      {/* <header className="App-header"></header> */}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <p style={{ color: "white", fontSize: "40px", fontStyle: "italic" }}>
          E-voting-system
        </p>
        <div
          style={{
            display: "flex",
            height: "fit-content",
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <StyledButton onClick={fetchGreeting}>Fetch greeting</StyledButton>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              height: "fit-content",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <StyledButton onClick={setGreeting}>Set greeting</StyledButton>
            <input
              style={{ marginTop: "20px", fontSize: "40px" }}
              onChange={(e) => setGreetingValue(e.target.value)}
              placeholder="Set greeting"
              value={greeting}
            />
          </div>
          <StyledButton>Request account</StyledButton>
        </div>
        <p style={{ color: "white", fontSize: "40px", fontStyle: "italic" }}>
          Bottom
        </p>
      </div>
    </div>
  );
}

export default App;
