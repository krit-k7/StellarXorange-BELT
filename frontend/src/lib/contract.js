import * as StellarSdk from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const CONTRACT_ID = "CB5C5K372KUJQJYNISD5MSE76FMVLPJYQK5RVTZDM3SUK6JJFAMJLYL3";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";

const rpc = new StellarSdk.rpc.Server(RPC_URL);

export async function createBillOnChain(
  creatorAddress,
  totalAmount,
  participants,
) {
  try {
    const account = await rpc.getAccount(creatorAddress);
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const participantAddresses = participants.map((p) =>
      new StellarSdk.Address(p).toScVal(),
    );

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "create_bill",
          new StellarSdk.Address(creatorAddress).toScVal(),
          StellarSdk.nativeToScVal(totalAmount, { type: "i128" }),
          StellarSdk.xdr.ScVal.scvVec(participantAddresses),
          new StellarSdk.Address(creatorAddress).toScVal(),
        ),
      )
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(transaction);
    const signedResult = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      network: "TESTNET",
    });

    if (signedResult.error) throw new Error(signedResult.error);

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedResult.signedTxXdr,
      NETWORK_PASSPHRASE,
    );

    const result = await rpc.sendTransaction(signedTx);
    return { success: true, hash: result.hash };
  } catch (e) {
    console.error("Contract error:", e);
    return { success: false, error: e.message };
  }
}

export async function payShareOnChain(payerAddress, billId) {
  try {
    const account = await rpc.getAccount(payerAddress);
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "pay_share",
          StellarSdk.nativeToScVal(billId, { type: "u64" }),
          new StellarSdk.Address(payerAddress).toScVal(),
        ),
      )
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(transaction);
    const signedResult = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      network: "TESTNET",
    });

    if (signedResult.error) throw new Error(signedResult.error);

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedResult.signedTxXdr,
      NETWORK_PASSPHRASE,
    );

    const result = await rpc.sendTransaction(signedTx);
    return { success: true, hash: result.hash };
  } catch (e) {
    console.error("Contract error:", e);
    return { success: false, error: e.message };
  }
}

export async function getBillFromChain(billId) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const result = await rpc.simulateTransaction(
      new StellarSdk.TransactionBuilder(
        await rpc.getAccount(
          "GDWIJADFWPIYYLE564WV5JL2CAUPQ2PJNLERO7Y3HPBGHCBXSBU6H7ZM",
        ),
        { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE },
      )
        .addOperation(
          contract.call(
            "get_bill",
            StellarSdk.nativeToScVal(billId, { type: "u64" }),
          ),
        )
        .setTimeout(30)
        .build(),
    );
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
