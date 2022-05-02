# Decentralized E-Voting System

This project showcases a decentralized e-voting application using blokchain. Solidity was the language used to write the smart smart contracts, while React was the chosen web framework. The connection between the components of the infrastrcture is performed using the libraries Hardhat, Web3.js and Ethers.js.

In order to perform the setup and run the project type in the following commands:

```shell
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt install yarn
sudo apt update
yarn install
yarn start
```

Additionally, to compile the smart contracts or generate test accounts for local development try these commands:

```shell
yarn hardhat compile
yarn hardhat node
```
