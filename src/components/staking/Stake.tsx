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
    Progress
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
import { getProxies, getStorage, removeProxy, sleep } from "@/app/utils";

import { 
    useVoucherUtils,
    useSignlessUtils 
} from "@/app/hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Modal } from "../shared/modal";
import { ProgressBar } from "../shared/progressbar";

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
    const [progressStatus, setProgressStatus] = useState(0);
    const [modalSubtitle, setModalSubtitle] = useState("Generating vouchers...");
    const [modalOpen, setIsModalOpen] = useState(false);

    const {
        pair,
        storageVoucher,
        createNewSession,
        unlockPair,
        checkProxyBalance
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
        setIsModalOpen(true);

        const amount = contract.toPlank(Number(stakeAmount));

        const payload: StakeRequest = {
            amount: amount,
            sessionForAccount: null
        }

        let pair_data: [KeyringPair | undefined, `0x${string}` | undefined] = [undefined, undefined];

        let storagePair = getStorage()[account.address];
        
        if (!storagePair) {
            pair_data = await createNewSession(
                account.decodedAddress,
                setModalSubtitle,
                setProgressStatus
            );
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

        setModalSubtitle("Updating voucher ...");
        setProgressStatus(55);

        await checkVoucherForUpdates(
            decodeAddress(pair_data[0]?.address!),
            pair_data[1]!,
        );

        setModalSubtitle("Updating proxy account ...");
        setProgressStatus(65);

        await checkProxyBalance(
            pair_data[0]!,
            account.decodedAddress
        );

        try {
            setModalSubtitle("Sending tokens for Staking ...");
            setProgressStatus(75);

            await contract.stake(
                payload, 
                () => {
                    setIsButtonEnabled(true);
                    setModalSubtitle("Finished!");
                    setProgressStatus(100);
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

            await sleep(2);
            setModalSubtitle("");
            setProgressStatus(0);
            setIsModalOpen(false);
        } catch(e) {
            console.log(e);
            contract.errorAlert("Operation cancelled");
            setIsButtonEnabled(true);
            setIsModalOpen(false);
            setProgressStatus(0);
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
            {
                modalOpen && (
                    <Modal 
                        heading="Staking VARA"
                        onClose={() => {    }}
                    >
                        <h3
                            style={{
                                color: "white",
                                fontSize: "18px",
                                textAlign: "center"
                            }}
                        >
                            {modalSubtitle}
                        </h3>
                        <br />
                        <Progress
                            borderRadius={20}
                            background={"orange"}
                            value={progressStatus}
                            sx={{
                                // Aquí se aplica el estilo al elemento interno que cambia su ancho
                                '& [role="progressbar"]': {
                                    transition: 'width 1.5s ease-in-out',
                                },
                            }}
                            colorScheme="green"
                            isAnimated
                            hasStripe
                        />
                        
                    </Modal>
                )
            }
        </TabPanel>
    )
}



        // 2581.8645
        // 2578.4949 
        // BALANCE USUARIO

        // 1,834,046,242,900
        // 1,669,366,793,600
        // 1,504,687,344,300
        // 1,340,001,245,600
        // BALANCE ACTUAL

       

        

        


        // 2051315867312000
        // 2,051,315,867,312,000
        // 2048918999837300
        // 2,048,918,999,837,300

        // 2,396,867,474,700



        // 2078415965222700
        // 2,078,415,965,222,700
        // 2074061917191200
        // 2,074,061,917,191,200