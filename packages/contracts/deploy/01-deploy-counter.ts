import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying EncryptedCounter with account:", deployer);

  const encryptedCounter = await deploy("EncryptedCounter", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("EncryptedCounter deployed to:", encryptedCounter.address);
};

func.tags = ["EncryptedCounter"];
export default func;
