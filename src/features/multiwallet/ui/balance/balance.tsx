import {
    useAccount,
    useAccountDeriveBalancesAll,
    useAlert,
    useApi,
    useBalance,
    useBalanceFormat
} from '@gear-js/react-hooks';
import styles from "@/features/multiwallet/ui/balance/Wallet.module.scss";
import {Image} from "@chakra-ui/react";
import VaraLogo from "@/assets/images/icons/ava-vara-black.svg";
import {useCallback, useEffect, useState} from "react";
import {SmartContract} from "@/Backend/SmartContract";

const Balance = () => {
  const { isApiReady, api } = useApi();
  const balances = useAccountDeriveBalancesAll();
  const { account, accounts } = useAccount();
  const { balance } = useBalance(account?.address);
  const alert = useAlert();
  const { getFormattedBalance } = useBalanceFormat();
  const [gvaraBalance, setGvaraBalance] = useState(0);

    const getBalance = useCallback(() => {
        const contract = new SmartContract(api!, account!, accounts, alert)

        contract.balanceOf().then((balance) => {
            setGvaraBalance(balance);
        })
    }, [api, account, accounts, alert])

    useEffect(() => {
        getBalance()
    }, [getBalance, balance]);

  const formattedBalance = isApiReady && balances ? getFormattedBalance(balances.freeBalance) : undefined;

  return formattedBalance ? (
      <div className={styles.wallet}>
          <div className={styles.tokens}>
              <p className={styles.balance}>
                  {formattedBalance.value}
                  <span className={styles.currency}>{formattedBalance.unit}</span>
                  <Image marginLeft="1.5" width="20px" src={VaraLogo}/>
              </p>
              <p className={styles.balance}>
                  {gvaraBalance} <span className={styles.currency}>gVARA</span>
              </p>
          </div>
      </div>
  ) : null;
};

export {Balance};
