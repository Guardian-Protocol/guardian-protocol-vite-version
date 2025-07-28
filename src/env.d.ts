interface ImportMetaEnv {
  readonly VITE_NODE_ADDRESS: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_FT_CONTRACT_ADDRESS: string;
  readonly VITE_STORE_ADDRESS: string;
  readonly VITE_STASH_ADDRESS: string;
  readonly VITE_SPONSOR_NAME: string;
  readonly VITE_SPONSOR_MNEMONIC: string;
  // readonly VITE_TESTNET_WEBSITE_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
