import { Dictionary, toNano } from 'ton-core';
import { WalletId, WalletV5 } from '../wrappers/wallet-v5';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { LibraryDeployer } from '../wrappers/library-deployer';
import { getSecureRandomBytes, keyPairFromSeed } from 'ton-crypto';

/*
    DOESN'T WORK WITH TONKEEPER. CHOOSE DEPLOY WITH MNEMONIC
 */
export async function run(provider: NetworkProvider) {
    const keypair = keyPairFromSeed(await getSecureRandomBytes(32));
    console.log('KEYPAIR PUBKEY', keypair.publicKey.toString('hex'));
    console.log('KEYPAIR PRIVATE_KEY', keypair.secretKey.toString('hex'));

    const walletV5 = provider.open(
        WalletV5.createFromConfig(
            {
                seqno: 0,
                walletId: new WalletId({ networkGlobalId: -3 }).serialized, // testnet
                publicKey: keypair.publicKey,
                extensions: Dictionary.empty()
            },
            LibraryDeployer.exportLibCode(await compile('wallet_v5'))
        )
    );

    await walletV5.sendDeploy(provider.sender(), toNano('0.1'));

    await provider.waitForDeploy(walletV5.address);

    console.log('WALLET ADDRESS', walletV5.address);
}
