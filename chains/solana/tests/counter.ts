import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";

describe("counter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;

  it("Is initialized!", async () => {
    const counter = anchor.web3.Keypair.generate();
    await program.methods.increment()
      .accounts({ counter: counter.publicKey })
      .signers([counter])
      .rpc();
    const account = await program.account.counter.fetch(counter.publicKey);
    console.log('Count:', account.count.toString());
  });
});
