import { useAccount } from "@gear-js/react-hooks";
import { useState } from "react";
import { AccountsModal } from "./accounts-modal";
import { AccountButton } from "./account-button";
import { Balance } from "./balance";
import styles from "./MultiWallet.module.scss";
import {Button} from "@chakra-ui/react";

const MultiWallet = ({balanceChanged}: any) => {
  const { account, isAccountReady } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className={styles.wallet}>
        <Balance balanceChanged={balanceChanged} />
        {isAccountReady &&
          (account ? (
            <AccountButton
              isNavBar={true}
              name={account.meta.name}
              address={account.address}
              onClick={openModal}
            />
          ) : (
              <Button
                  size="lg"
                  borderRadius="10"
                  backgroundColor="black"
                  textColor="white"
                  variant="ghost"
                  _hover={{ color: "gray.400"}}
                  transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                  border="2px"
                  borderColor="yellow.300"
                  w="300px"
                  onClick={openModal}
              > connect wallet </Button>
          ))}
      </div>

      {isModalOpen && <AccountsModal close={closeModal} />}
    </>
  );
};

export { MultiWallet };
