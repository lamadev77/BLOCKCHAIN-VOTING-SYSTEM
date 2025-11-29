const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const ElectionFactory = await ethers.getContractFactory("Election");
    const election = await ElectionFactory.deploy();
    await election.deployed();

    console.log("Election contract deployed to:", election.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });