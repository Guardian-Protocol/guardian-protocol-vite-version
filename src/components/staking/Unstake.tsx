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
} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import { SmartContract } from "@/services/SmartContract";
import { AnyJson } from "@polkadot/types/types";
import VaraLogo from "@/assets/images/VaraLogo.png";
import Advertencia from "@/assets/images/icons/advertencia.svg";
import {useBalance} from "@gear-js/react-hooks";
import {AccountsModal} from "@/components/header/multiwallet/accounts-modal";
import { formatDate } from "@/utils/date";
import { UnstakeTokenInput } from "../shared/TokenInput/UnstakeTokenInput";

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

    const {balance} = useBalance(account?.address);
    const [amount, setAmount] = useState("0");
    const [gvaraValance, setGvaraBalance] = useState(0);
    const [rewardAfter, setRewardAfter] = useState(0);
    const [tokenValue, setTokenValue] = useState(0);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const handleVaraUnstakeInputChange = async (event: any) => {
        const { value } = event.target;
        if (!Number.isNaN(Number(value))) {

            if (value.length === 0) {
                setAmount("0");
                setRewardAfter(0);
                return;
            }

            setAmount((value.startsWith("0")) ? value.slice(1) : value);
            setRewardAfter(contract.toFixed4(Number(value) * tokenValue));
            setIsAmountInvalid(false);
        }
        if (value === "") {
            setAmount("0")
        }
    }

    const maxAmountVaraUnstake = async () => {
        if (gvaraValance > 0) {
            const reward = (Number(gvaraValance) * tokenValue);
            setAmount(String(Number(gvaraValance)));
            setRewardAfter(contract.toFixed4(reward));
        }
    };

    const unstakeVara = async () => {
        if (Number(amount) > gvaraValance || Number(amount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }

        contract.loadingAlert("Unstaking VARA", 5000, () => {
            setIsButtonDisabled(false);

            setTimeout(() => {
                setIsButtonDisabled(true);
            }, 5000);
        });

        const unstakeValue = contract.toPlank(Number(amount));
        const payload: AnyJson = {
            Unstake: {
                amount: unstakeValue,
                reward: contract.toPlank(rewardAfter),
                user: account.decodedAddress,
                date: formatDate(new Date()),
                liberationEra: await contract.getCurrentEra() + 14,
            }
        }

        await contract.unstake(payload, 0, unstakeValue, () => {
            setRefresh(!refresh);
            setBalanceChanged(!balanceChanged);
        });
    }

    const getBalance = useCallback(async () => {
        contract.balanceOf().then((balance) => {
            setGvaraBalance(contract.toFixed4(balance));
        });

        contract.tokenValue().then((value) => {
            setTokenValue(value / contract.plat);
        });
    }, [contract]);

    useEffect(() => {
        getBalance().then();
    }, [getBalance, contract, balance, isButtonDisabled]);

    useEffect(() => { }, [balance, gvaraValance, isButtonDisabled, refresh]);

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
                    <Tbody>
                        <Grid templateColumns="1fr auto" gap="10">
                            <Tr
                                id="espacio"
                                style={{ marginBottom: "3px !important" }}
                            >
                                <Td fontSize="18px" style={{ color: "white" }}>
                                    Amount
                                </Td>
                                <Td style={{ visibility: "hidden" }}>.</Td>
                            </Tr>
                            <Td
                                fontSize="18px"
                                isNumeric
                                textAlign="end"
                                style={{ color: "white" }}
                            >
                                Available to unlock: {gvaraValance} gVARA
                            </Td>
                        </Grid>

                        <UnstakeTokenInput
                            tokenLogo={VaraLogo}
                            amount={amount}
                            valueAfterToken={rewardAfter}
                            isAmountInvalid={isAmountInvalid}
                            handleInputChange={handleVaraUnstakeInputChange}
                            handleMaxButtonPressed={maxAmountVaraUnstake}
                            tokenValue={tokenValue}
                        />

                        <Tr style={{ visibility: "hidden" }}>
                            <Td style={{ color: "white" }}>.</Td>
                            <Td style={{ color: "white" }}>.</Td>
                            <Td isNumeric>.</Td>
                        </Tr>

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
                                            <Text fontSize="md">VARA will be available for withdrawal in 14 Eras (6-7 days)</Text>
                                        </Flex>
                                    </Flex>
                                </Box>
                            </Flex>
                        </TabPanel>
                        <Td width="100%" display="flex" justifyContent="center">
                            {account ? (
                                isButtonDisabled ? (
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
        </TabPanel>
    )
}