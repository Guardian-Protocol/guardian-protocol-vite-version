import { useAccount } from "@gear-js/react-hooks";
import { Button, Modal } from "@gear-js/ui";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { isWeb3Injected } from "@polkadot/extension-dapp";
import { AiOutlineLogout } from "react-icons/ai";
import { AccountButton } from "../account-button";
import { useWallet } from "../hooks";
import { WALLETS } from "@/components/header/multiwallet/consts";
import {Button as ButtonC, Card, HStack } from "@chakra-ui/react";
import { Heading } from "@/components/shared/heading";

type Props = {
  close: () => void;
};

const AccountsModal = ({ close }: Props) => {
  const { account, extensions, login, logout } = useAccount();

  const {
    wallet,
    walletAccounts,
    setWalletId,
    resetWalletId,
    getWalletAccounts,
  } = useWallet();

  const handleLogoutClick = () => {
    logout();
    close();
  };

  const handleAccountClick = (newAccount: InjectedAccountWithMeta) => {
    login(newAccount);
    close();
  };

  const heading = wallet ? "Connect account" : "Choose Wallet";

  const getWallets = () =>
    WALLETS.map(([id, { image, name }]: any) => {
      const isEnabled = extensions?.some((extension) => extension.name === id);

      const accountsCount = getWalletAccounts(id)?.length;
      const accountsStatus = `${accountsCount} ${
        accountsCount === 1 ? "account" : "accounts"
      }`;

      return (
          <ButtonC backgroundColor="yellow.200" height={"55px"} margin={"5px"} width={"100%"} onClick={() => setWalletId(id)}>
              <HStack width={"100%"}>
                  <img src={image} alt={name} width="20" height="20"/>
                  <p>{name}</p>
                  <p>{isEnabled ? "Enabled" : "Disabled"}</p>
                  {isEnabled && <p>{accountsStatus}</p>}
              </HStack>
          </ButtonC>
      );
    });

    const getAccounts = () =>
        walletAccounts?.map((_account) => {
            const {address, meta} = _account;
            const isActive = address === account?.address;

            const handleClick = () => {
                if (isActive) return;
        handleAccountClick(_account);
      };

      return (
        <Card key={address} margin={"20px"}>
            <AccountButton
                isNavBar={false}
                name={meta.name}
                address={address}
                onClick={handleClick}
            />
        </Card>
      );
    });

  return (
    <Modal heading={heading} close={close}>
      {isWeb3Injected ? (
        <>
            {!wallet && <ul>{getWallets()}</ul>}

            {!!wallet &&
                (walletAccounts?.length ? (
                    <ul>{getAccounts()}</ul>
                ) : (
                    <Heading color="white" size="xs">
                        No accounts found. Please open your Polkadot extension and
                        create a new account or import existing. Then reload this
                        page.
                    </Heading>
                ))}

          <footer>
            {wallet && (
              <ButtonC
                backgroundColor={"transparent"}
                _hover={{ backgroundColor: "transparent" }}
                color={"white"}
                onClick={resetWalletId}
                margin={"10px"}
              > {wallet.name} </ButtonC>
            )}

              {account && (
                  <Button
                      icon={AiOutlineLogout}
                      text="Logout"
                      color="transparent"
                      onClick={handleLogoutClick}
                  />
              )}
          </footer>
        </>
      ) : (
        <p>
          Wallet extension was not found or disconnected. Please check how to
          install a supported wallet and create an account{" "}
          <a
            href="https://wiki.gear-tech.io/docs/idea/account/create-account"
            target="_blank"
            rel="noreferrer"
            className="link-text"
          >
            here
          </a>
          .
        </p>
      )}
    </Modal>
  );
};

export { AccountsModal };
