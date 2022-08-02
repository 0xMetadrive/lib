import axios from "axios";
import { ethers } from "ethers";
import { ecrecover } from "@ethereumjs/util";
import secp256k1 from "secp256k1";
import ethCrypto from "eth-crypto";

const hexStringToBuffer = (hexString: string) =>
  Buffer.from(hexString.slice(2), "hex");

export const getPublicKey = async (
  address: string,
  rpcUrl: string,
  blockExplorerUrl: string,
  blockExplorerToken: string
) => {
  const url = new URL(blockExplorerUrl);
  url.searchParams.append("module", "account");
  url.searchParams.append("action", "txlist");
  url.searchParams.append("address", address);
  url.searchParams.append("offset", "1");
  url.searchParams.append("apikey", blockExplorerToken);

  const { data } = await axios.get(url.toString());
  const txHash = data.result[0].hash;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const txDetails = await provider.getTransaction(txHash);
  console.log(txDetails);

  if (
    txDetails.v === undefined ||
    txDetails.r === undefined ||
    txDetails.s === undefined
  ) {
    return null;
  }

  const pkBuffer = ecrecover(
    hexStringToBuffer(txDetails.hash),
    BigInt(txDetails.v),
    hexStringToBuffer(txDetails.r),
    hexStringToBuffer(txDetails.s),
    BigInt(txDetails.chainId)
  );
  const pkArrayBuffer = new Uint8Array(pkBuffer);
  console.log(pkArrayBuffer);

  //   const compressedPk = ethCrypto.publicKey.compress(pkBuffer.toString("hex"));
  //   console.log(new Uint8Array(Buffer.from(compressedPk, "hex")));

  const compressedPk = secp256k1.publicKeyConvert(
    new Uint8Array([...Buffer.from("04", "hex"), ...pkArrayBuffer]),
    true
  );
  console.log(compressedPk);

  //   console.log(publicKeyBuffer.toString("base64"));
  //   console.log(x.toString());
};

getPublicKey(
  "0x448cd8A44E35f8f20F681c640e1799074Ef16Ff6",
  "https://polygon-mumbai.g.alchemy.com/v2/2srvbisIVhENCi6tIsQuPtBVdZ3seF5x",
  "https://api-testnet.polygonscan.com/api",
  "UH1MBREMBE6KI4EX4VKWVWFWDR56YNYNX5"
).then(() => {});
