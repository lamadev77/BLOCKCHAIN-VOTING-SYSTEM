import { SmartContract } from "../constants";
import Web3 from "web3";

const web3: any = new Web3(Web3.givenProvider);
declare const window: any;

export const disconnectWallet = async () => {
  await web3?.ethereum.disconnect();
}

export const getCandidateList = async () => {
  if (!window.ethereum) return [];
  return await SmartContract.methods.getAllCandidates().call();
}

export const getVoterList = async () => {
  if (!window.ethereum) return [];
  return await SmartContract.methods.getAllVoters().call();
}

export const getPartyList = async () => {
  if (!window.ethereum) return [];
  return await SmartContract.methods.getAllParties().call();
}

export const getElectionList = async () => {
  if (!window.ethereum) return [];
  const list = await SmartContract.methods.getAllElections().call();
  return list?.slice(1);
}

export const getFaqs = async () => {
  if (!window.ethereum) return [];
  return await SmartContract.methods.getAllFAQs().call();
}

export const getTotalVotersCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalVoter().call();
}

export const getMaleVotersCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalMaleVoters().call();
}

export const getFemaleVotersCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalFemaleVoters().call();
}

export const getOthersVotersCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalOtherVoters().call();
}

export const getTotalCandidateCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalCandidate().call();
}

export const getTotalPartiesCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalParty().call();
}

export const getTotalElectionCount = async () => {
  if (!window.ethereum) return 0;
  return await SmartContract.methods.totalElection().call();
}

export const isAdmin = async (address: string) => {
  try {
    if (!window?.ethereum) return 0;
    return await SmartContract.methods.isAdmin(address).call();
  } catch (error) {
    console.error(error);
  }
}


export const getCandidateDetails = async (address: string) => {
  try {
    if (!window?.ethereum) return 0;
    return await SmartContract.methods.getCandidateDetails(address).call();
  } catch (error) {
    console.error(error);
  }
}

export const getVoterDetails = async (address: string) => {
  try {
    if (!window?.ethereum) return 0;
    return await SmartContract.methods.getVoterDetails(address).call();
  } catch (error) {
    console.error(error);
  }
}

export const getAllBlocks = () => {
  try {
    web3.eth.getBlockNumber((error, latestBlockNumber) => {
      if (!error) {
        console.log(`Latest block number: ${latestBlockNumber}`);
      } else {
        console.error(error);
      }
    });
  } catch (error) {
    console.error(error);
    return []
  }
}