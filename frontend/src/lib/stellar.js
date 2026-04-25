import * as StellarSdk from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org",
);

export async function sendPayment(fromAddress, toAddress, amount) {
  try {
    const sourceAccount = await server.loadAccount(fromAddress);
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: toAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        }),
      )
      .addMemo(StellarSdk.Memo.text("Stellar Split Payment"))
      .setTimeout(30)
      .build();

    const signedResult = await signTransaction(transaction.toXDR(), {
      networkPassphrase: StellarSdk.Networks.TESTNET,
      network: "TESTNET",
    });

    if (signedResult.error) {
      throw new Error(signedResult.error);
    }

    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedResult.signedTxXdr,
      StellarSdk.Networks.TESTNET,
    );

    const result = await server.submitTransaction(signedTransaction);
    return { success: true, hash: result.hash };
  } catch (e) {
    console.log("Full error:", JSON.stringify(e.response?.data, null, 2));
    return {
      success: false,
      error: e.response?.data?.extras?.result_codes?.transaction || e.message,
    };
  }
}

export async function getBalance(address) {
  try {
    const account = await server.loadAccount(address);
    const xlmBalance = account.balances.find((b) => b.asset_type === "native");
    return xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : "0";
  } catch (e) {
    return "0";
  }
}
