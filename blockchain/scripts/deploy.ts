import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying MedicineVerification...");

  const medicineVerification =
    await ethers.deployContract("MedicineVerification");

  await medicineVerification.waitForDeployment();

  const address = await medicineVerification.getAddress();

  console.log("MedicineVerification deployed to:");
  console.log(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});