import { useAccount, useApi } from "@gear-js/react-hooks";
import { ApiLoader } from "@/components";
import { Header } from "@/components/layout";
import { withProviders } from "@/app/hocs";
import { useWalletSync } from "@/features/wallet/hooks";
import { Routing } from "./pages";
import '@/App.css';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  useWalletSync();
  const isAppReady = isApiReady && isAccountReady;

  return (
    <>
      <Header/>
      {isAppReady ? <Routing /> : <ApiLoader />}
    </>
  );
}

export const App = withProviders(Component);