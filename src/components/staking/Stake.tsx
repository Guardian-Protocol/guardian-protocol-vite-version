import {
    TabPanel,
    Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Button,
    Grid,
    Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SmartContract } from "@/services/SmartContract";
import VaraLogo from "@/assets/images/icons/ava-vara-black.svg";
import {Account, useBalance, useBalanceFormat} from "@gear-js/react-hooks";
import {AccountsModal} from "@/components/header/multiwallet/accounts-modal";
import { StakeTokenInput } from "../shared/TokenInput/StakeTokenInput";
import { StakeRequest } from "@/services/models/StateRequest";
import { useAlert } from "@gear-js/react-hooks";
import { KeyringPair } from '@polkadot/keyring/types';
import { useApi } from "@gear-js/react-hooks"; 
import { decodeAddress } from "@gear-js/api";
import { getStorage } from "@/app/utils";

import { 
    useVoucherUtils,
    useSignlessUtils 
} from "@/app/hooks";

type StakeProps = {
    account: Account;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    contract: SmartContract;
    balanceChanged: any;
    setBalanceChanged: any
};

type formatedBalance = { value: string; unit: string } | undefined;

export function Stake({account, isModalOpen, openModal, closeModal, contract, balanceChanged, setBalanceChanged }: StakeProps) {
    const sponsorName = import.meta.env.VITE_SPONSOR_NAME;
    const sponsorMnemonic = import.meta.env.VITE_SPONSOR_MNEMONIC;
    const { getFormattedBalance } = useBalanceFormat();
    const { balance } = useBalance(account?.address);
    const [lockedBalance, setLockedBalance] = useState(0)
    const [isButtonEnabled, setIsButtonEnabled] = useState(true);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [valueAfterToken, setValueAfterToken] = useState(0);
    const [stakeAmount, setStakeAmount] = useState("0");
    const [gas, setGas] = useState(0);
    const alert = useAlert();

    const {
        pair,
        storageVoucher,
        createNewSession,
        unlockPair
    } = useSignlessUtils(contract, null);

    const { checkVoucherForUpdates, vouchersInContract } = useVoucherUtils(sponsorName, sponsorMnemonic);

    const{ api, isApiReady } = useApi();

    const formattedBalance: formatedBalance = balance ? getFormattedBalance(balance) : undefined;

    const stakeVara = async () => {
        if (!isApiReady) {
            console.log("api is not ready");
            return;
        }

        if (!isButtonEnabled) return;

        if (Number(stakeAmount) > Math.floor(Number(formattedBalance?.value.split(',').join(''))) - 1 || Number(stakeAmount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }

        setIsButtonEnabled(false);
        let id = contract.loadingAlert("Staking VARA - Dont leave the page");
        // let id = alert.loading("Staking VARA - Dont leave the page", { style: contract.alertStyle });
        // let id = alert.loading(<p>"Staking VARA - Dont leave the page"</p>, { style: contract.alertStyle });
        
        const stakeValue = contract.toPlank(valueAfterToken);
        const amount = contract.toPlank(Number(stakeAmount));

        const payload: StakeRequest = {
            amount: amount,
            sessionForAccount: null
            // tokenAmount: stakeValue,
            // user: contract.currentUser()?.decodedAddress!!,
            // date: formatDate(new Date()),
        }

        let pair_data: [KeyringPair | undefined, `0x${string}` | undefined] = [undefined, undefined];

        let storagePair = getStorage()[account.address];

        if (!storagePair) {
            pair_data = await createNewSession(account.decodedAddress);
        } else {
            const pairToUse = !pair ? unlockPair(account.decodedAddress) : pair;
            const voucherId = storageVoucher 
                ? storageVoucher.id 
                : (await vouchersInContract(
                    contract.getContractAddress,
                    decodeAddress(pairToUse.address)
                  ))[0];

            pair_data = [ pairToUse, voucherId ];

            await contract.checkSession(pairToUse, account.decodedAddress);
        }

        await checkVoucherForUpdates(
            decodeAddress(pair_data[0]?.address!),
            pair_data[1]!,
            10,
            1_200,
            3,
            () => {},
            () => {}
        );

        try {
            await contract.stake(
                payload, 
                () => {
                    setIsButtonEnabled(true);
                    // contract.closeAlert(id);
                    alert.remove(id);
                    setStakeAmount("0");
                    setValueAfterToken(0);

                    setTimeout(() => {
                        setBalanceChanged(!balanceChanged);
                    }, 3500);
                },
                pair_data[0],
                account.decodedAddress,
                sponsorName,
                sponsorMnemonic
            );
        } catch {
            contract.errorAlert("Operation cancelled")
            contract.closeAlert(id);
            setIsButtonEnabled(true);
            setStakeAmount("0");
            setValueAfterToken(0);
        }
    }

    useEffect(() => {
        contract.balanceOf().then((gBalance) => {
            setLockedBalance(contract.toFixed4(gBalance));
        })        
    }, [contract, balance, balanceChanged, isButtonEnabled, stakeAmount]);

    return (
        <TabPanel
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <TableContainer>
                <Table
                    variant="simple"
                    colorScheme="teal"
                    className="table-content"
                    w="100%"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Tbody w='100%' >
                        <Flex justifyContent={{base:'center', md: 'space-between'}}  w={'90%'} marginRight={'auto'} marginLeft={'auto'} marginBottom={'5px'} marginTop={'5px'}>
                            <Td fontSize={{base: '16px', md: '18px'}} style={{ color: "white" }}
                            paddingInline={0}
                            paddingTop={0}
                            >
                                Amount
                            </Td>
                            <Td
                                fontSize={{base: '16px', md: '18px'}}
                                isNumeric
                                textAlign="end"
                                style={{ color: "white" }}
                                display={{base: 'block', md: 'flex'}}
                                whiteSpace={{base: 'pre-line', md: 'nowrap'}}
                                w={{base: '80%', md: 'auto'}}
                                paddingInline={0}
                                paddingTop={0}
                            >
                                Available: {formattedBalance?.value ? (Number(formattedBalance?.value.split(',').join(''))) : (String(0))} VARA
                            </Td>
                        </Flex>

                        <StakeTokenInput 
                            tokenLogo={VaraLogo} 
                            amount={stakeAmount} 
                            setAmount={setStakeAmount} 
                            contract={contract} 
                            formattedBalance={formattedBalance}
                            valueAfterToken={valueAfterToken}
                            setValueAfterToken={setValueAfterToken}
                            isAmountInvalid={isAmountInvalid}
                            setIsAmountInvalid={setIsAmountInvalid}
                            setGas={setGas}
                            gas={gas}
                        />

                        <Grid templateColumns="1fr auto" gap="1" mt={{base: '10px', md: '0'}}>
                            <Tr textColor="white">
                                <Td fontSize="18px" style={{ color: "white" }}>
                                    Total Balance{" "}
                                </Td>
                                <Td style={{ visibility: "hidden" }}>.</Td>
                            </Tr>
                            <Td
                                fontSize="18px"
                                isNumeric
                                textAlign="end"
                                style={{ color: "white" }}
                            >
                                {formattedBalance?.value ? (contract.toFixed4(Number(formattedBalance?.value.split(',').join('')) + lockedBalance)) : (String(0))}
                            </Td>
                        </Grid>

                        <Grid templateColumns="1fr auto" gap="1">
                            <Tr textColor="white">
                                <Td fontSize="18px" style={{ color: "white" }}>
                                    Locked
                                </Td>
                                <Td style={{ visibility: "hidden" }}>.</Td>
                            </Tr>
                            <Td
                                fontSize="18px"
                                isNumeric
                                textAlign="end"
                                style={{ color: "white" }}
                            >
                                {contract.toFixed4(lockedBalance)}
                            </Td>
                        </Grid>

                        <Grid templateColumns="1fr auto" gap="1">
                            <Tr textColor="white">
                                <Td fontSize="18px" style={{ color: "white" }}>
                                    Available
                                </Td>
                                <Td style={{ visibility: "hidden" }}>.</Td>
                            </Tr>
                            <Td
                                fontSize="18px"
                                isNumeric
                                textAlign="end"
                                style={{ color: "white" }}
                            >
                                {formattedBalance?.value ? (Number(formattedBalance?.value.split(',').join(''))) : (String(0))}
                            </Td>
                        </Grid>

                        <Td
                            width="100%"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                        >
                            {account ? (
                                <Button
                                    colorScheme="teal"
                                    size="lg"
                                    style={{
                                        color: "black",
                                        background: "#F8AD18",
                                        width: "240px",
                                        opacity: isButtonEnabled ? 1.0 : 0.5
                                    }}
                                    onClick={stakeVara}
                                >
                                    Stake
                                </Button>
                            ) : (
                                <Button
                                    colorScheme="teal"
                                    size="lg"
                                    style={{
                                        color: "black",
                                        background: "#F8AD18",
                                        width: "240px",
                                    }}
                                    onClick={openModal}
                                >
                                    Connect Wallet
                                </Button>
                            )}
                            {isModalOpen && <AccountsModal close={closeModal} />}
                        </Td>
                    </Tbody>
                </Table>
            </TableContainer>
        </TabPanel>
    )
}