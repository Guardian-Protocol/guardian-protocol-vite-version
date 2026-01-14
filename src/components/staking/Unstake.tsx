import {
    TabPanel,
    Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Button,
    Image,
    Text,
    Grid,
    Flex,
    Box,
    Progress
} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import { SmartContract } from "@/services/SmartContract";
import VaraLogo from "@/assets/images/VaraLogo.png";
import Advertencia from "@/assets/images/icons/advertencia.svg";
import { useBalance} from "@gear-js/react-hooks";
import {AccountsModal} from "@/components/header/multiwallet/accounts-modal";
import { UnstakeTokenInput } from "../shared/TokenInput/UnstakeTokenInput";
import { UnstakeRequest } from "@/services/models/UnstakeRequest";
import { KeyringPair } from '@polkadot/keyring/types';
import { useApi } from "@gear-js/react-hooks"; 
import { decodeAddress } from "@gear-js/api";
import { 
    useVoucherUtils,
    useSignlessUtils 
} from "@/app/hooks";
import { getStorage, sleep } from "@/app/utils";
import { Modal } from "../shared/modal";
import { formatNumber } from "@/utils";
import BigNumber from "bignumber.js";


type UnstakeProps = {
    account: any;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    contract: SmartContract;
    balanceChanged: any;
    setBalanceChanged: any
};

export function Unstake({
    openModal, 
    closeModal, 
    account, 
    isModalOpen, 
    contract, 
    balanceChanged, 
    setBalanceChanged 
}: UnstakeProps) {
    const sponsorName = import.meta.env.VITE_SPONSOR_NAME;
    const sponsorMnemonic = import.meta.env.VITE_SPONSOR_MNEMONIC;
    const {balance} = useBalance(account?.address);
    const [amount, setAmount] = useState("0");
    const [gvaraValance, setGvaraBalance] = useState(0);
    const [rewardAfter, setRewardAfter] = useState(new BigNumber(0));
    const [tokenValue, setTokenValue] = useState(new BigNumber(0));
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [gas, setGas] = useState(new BigNumber(0));
    const [progressStatus, setProgressStatus] = useState(0);
    const [modalSubtitle, setModalSubtitle] = useState("Preparing transaction..."); //useState("Generating vouchers...");
    const [modalOpen, setIsModalOpen] = useState(false);

    const {
        pair,
        storageVoucher,
        createNewSession,
        unlockPair,
        checkProxyBalance
    } = useSignlessUtils(contract, null);

    const { checkVoucherForUpdates, vouchersInContract } = useVoucherUtils(sponsorName, sponsorMnemonic);

    const handleVaraUnstakeInputChange = async (event: any) => {
        const { value: valueGet } = event.target;
        const value: string = valueGet.trim();

        if (Number.isNaN(Number(value))) {
            return;
        }

        if (value == "") {
            setAmount("0");
            setRewardAfter(new BigNumber(0));
            setGas(new BigNumber(0));
            return;
        }

        const regex = /[^0-9]/;

        if (regex.test(value)) {
            return;
        }

        // if (value === "") {
        //     setAmount("0");
        //     setRewardAfter(0);
        //     setGas(0);
        //     return;
        // }

        if (value.length === 0) {
            setAmount("0");
            setRewardAfter(new BigNumber(0));
            setGas(new BigNumber(0));
            return;
        }

        // const reward = Math.floor(Number(gvaraValance / (10**Number(import.meta.env.VITE_FT_DECIMALS))));
        const newAmount = new BigNumber(value);
        const oneGvara = (new BigNumber(10)).pow(import.meta.env.VITE_FT_DECIMALS);
        const tokenValue = new BigNumber(await contract.tokenValue());
        const totalVara = newAmount.multipliedBy(tokenValue);

        const reward = (newAmount.multipliedBy(tokenValue)).dividedBy(oneGvara);

        if (reward < newAmount) {return}

        setIsAmountInvalid(false);
        setAmount((value.startsWith("0")) ? value.slice(1) : value);
        // setRewardAfter(contract.toFixed4(Number(value) * tokenValue));
        setRewardAfter(totalVara);

        // setGas(await contract.unstakeGas(contract.toPlank(Number(amount))));
        const newGasValue = await contract.unstakeGas(newAmount.toString());
        setGas(new BigNumber(newGasValue));
    }

    const maxAmountVaraUnstake = async () => {
        if (gvaraValance > 0) {
            const oneGvara = (new BigNumber(10)).pow(import.meta.env.VITE_FT_DECIMALS);
            const gvaraBalance = new BigNumber(gvaraValance);
            const tokenValue = new BigNumber(await contract.tokenValue());
            const reward = (gvaraBalance.multipliedBy(tokenValue)).dividedBy(oneGvara); 

            setAmount(gvaraBalance.dividedBy(oneGvara).integerValue().toString());
            setRewardAfter(reward);
            const newGasValue = await contract.unstakeGas(amount);
            setGas(new BigNumber(newGasValue));
        }
    };

    const unstakeVara = async () => {
        if (!isButtonEnabled) return false;

        if (Number(amount) > gvaraValance || Number(amount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }
        setRefresh(true);

        setIsButtonEnabled(false);

        setIsModalOpen(true);

        // let pair_data: [KeyringPair | undefined, `0x${string}` | undefined] = [undefined, undefined];

        // let storagePair = getStorage()[account.address];

        // if (!storagePair) {
        //     pair_data = await createNewSession(
        //         account.decodedAddress,
        //         setModalSubtitle,
        //         setProgressStatus
        //     );
        // } else {
        //     const pairToUse = !pair ? unlockPair(account.decodedAddress) : pair;

        //     const voucherId = storageVoucher 
        //         ? storageVoucher.id 
        //         : (await vouchersInContract(
        //             contract.getContractAddress,
        //             decodeAddress(pairToUse.address)
        //           ))[0];

        //     pair_data = [ pairToUse, voucherId ];

        //     await contract.checkSession(pairToUse, account.decodedAddress);
        // }

        setProgressStatus(0);
        await sleep(1);

        // setModalSubtitle("Updating voucher ...");
        setModalSubtitle("Unstaking tokens ...");
        setProgressStatus(55);

        // await checkVoucherForUpdates(
        //     decodeAddress(pair_data[0]?.address!),
        //     pair_data[1]!,
        // );

        // setModalSubtitle("Updating proxy account ...");
        // setProgressStatus(65);

        // await checkProxyBalance(
        //     pair_data[0]!,
        //     account.decodedAddress
        // );

        const gVaraAmount = (10 ** Number(import.meta.env.VITE_FT_DECIMALS)) * Number(amount);


        const payload: UnstakeRequest = {
            amount: gVaraAmount, // contract.toPlank(Number(amount)),
            sessionForAccount: null //account.decodedAddress
        }


        try {
            // setModalSubtitle("Unstaking tokens ...");
            // setProgressStatus(75);

            await contract.unstake(
                payload, 
                () => {
                    setRefresh(false);
                    setIsButtonEnabled(true);
                    setAmount("0");
                    setRewardAfter(new BigNumber(0));
                    setModalSubtitle("Finished!");
                    setProgressStatus(100);
                    setTimeout(() => {
                        setBalanceChanged(!balanceChanged);
                    }, 3000)
                },
                // pair_data[0]!,
                // pair_data[1]!,
                // account.decodedAddress
            );
        } catch(e) {
            console.log(e)
            setIsButtonEnabled(true);
            setAmount("0");
            setRewardAfter(new BigNumber(0));
            contract.errorAlert("Operation cancelled")
        }

        await sleep(2);
        setModalSubtitle("");
        setProgressStatus(0);
        setIsModalOpen(false);
    }

    const getBalance = useCallback(async () => {
        contract.balanceOf().then((balance) => {
            setGvaraBalance(contract.toFixed4(balance));
        });

        contract.tokenValue().then((value) => {
            setTokenValue(new BigNumber(value));
        });
    }, [contract]);

    useEffect(() => {
        getBalance().then();
    }, [getBalance, contract, balance, isButtonEnabled]);

    useEffect(() => { }, [balance, gvaraValance, isButtonEnabled, refresh, gas]);

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
                        <Flex  justifyContent={{base:'center', md: 'space-between'}}  w={'90%'} marginRight={'auto'} marginLeft={'auto'} marginBottom={'5px'} marginTop={'5px'}>
                            <Td fontSize={{base: '16px', md: '18px'}} style={{ color: "white" }} paddingInline={0} paddingTop={0}>
                                Amount
                            </Td>
                            <Td style={{ visibility: "hidden" }}>.</Td>
                            <Td
                                fontSize={{base: '16px', md: '18px'}} 
                                isNumeric
                                paddingInline={0}
                                style={{ color: "white" }}
                                display={{base: 'block', md: 'flex'}}
                                whiteSpace={{base: 'pre-line', md: 'nowrap'}}
                                w={{base: '80%', md: 'auto'}}
                                paddingTop={0}
                            >
                                Available to unlock: {formatNumber(gvaraValance.toString(), 6, 4)} gVARA
                            </Td>
                        </Flex>

                        <UnstakeTokenInput
                            tokenLogo={VaraLogo}
                            amount={amount}
                            valueAfterToken={rewardAfter}
                            isAmountInvalid={isAmountInvalid}
                            handleInputChange={handleVaraUnstakeInputChange}
                            handleMaxButtonPressed={maxAmountVaraUnstake}
                            tokenValue={tokenValue}
                            gas={gas}
                            setGas={setGas}
                        />

                        <TabPanel
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Flex direction="column" w="100%">
                                <Box borderWidth="3px" borderRadius="lg" overflow="hidden" w="100%" borderColor="#F8AD18" bg="#131111" mt='5'>
                                    <Flex justify="space-between" p={5} align="center" w="100%">
                                        <Flex align="center" justifyContent="center" >
                                            <Image src={Advertencia} boxSize="45px" mr={6} />
                                            <Text fontSize="md" 
                                                display={{base: 'block', md: 'flex'}}
                                                whiteSpace={{base: 'pre-line', md: 'nowrap'}}>VARA will be available for withdrawal in 14 Eras (6-7 days)</Text>
                                        </Flex>
                                    </Flex>
                                </Box>
                            </Flex>
                        </TabPanel>
                        <Td width="100%" display="flex" justifyContent="center">
                            {account ? (
                                isButtonEnabled ? (
                                    <Button
                                        colorScheme="teal"
                                        size="lg"
                                        style={{
                                            color: "black",
                                            background: "#F8AD18",
                                            width: "240px",
                                        }}
                                        onClick={unstakeVara}
                                    >
                                        Unstake
                                    </Button>
                                ) : (
                                    <Button
                                        colorScheme="teal"
                                        size="lg"
                                        style={{
                                            color: "black",
                                            background: "#F8AD18",
                                            width: "240px",
                                            opacity: 0.5,
                                        }}
                                        onClick={() => {}}
                                    >
                                        Unstake
                                    </Button>
                                )
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
                        heading="Unstaking VARA"
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