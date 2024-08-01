interface ImportMetaEnv {
  readonly VITE_NODE_ADDRESS: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_FT_CONTRACT_ADDRESS: string;

  readonly VITE_CONTRACT_METADATA: string;
  readonly VITE_FT_CONTRACT_METADATA: string;
  readonly VITE_STORE_METADATA: string;
  readonly VITE_ADMIN_NMONIC: string;
  readonly VITE_STASH_ADDRESS: string;

  readonly VITE_TESTNET_WEBSITE_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}