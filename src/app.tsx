import { useAccount, useApi } from "@gear-js/react-hooks";
import { ApiLoader } from "@/components";
import { Header } from "@/components";
import { withProviders } from "@/app/hocs";
import { useWalletSync } from "./components/header/wallet/hooks";
import { Routing } from "./pages";
import '@/App.css';
import { useState } from "react";

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  useWalletSync();
  const isAppReady = isApiReady && isAccountReady;
  const [balanceChanged, setBalanceChanged] = useState(false)

  return (
    <>
      <Header balanceChanged={balanceChanged} />
      {isAppReady ? <Routing setBalanceChanged={setBalanceChanged} balanceChanged={balanceChanged} /> : <ApiLoader />}
    </>
  );
}

export const App = withProviders(Component);