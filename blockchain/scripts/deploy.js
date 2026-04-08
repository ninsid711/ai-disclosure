import hre from "hardhat";

async function main() {
  const Contract = await hre.ethers.getContractFactory("Disclosure");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  console.log("Deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
