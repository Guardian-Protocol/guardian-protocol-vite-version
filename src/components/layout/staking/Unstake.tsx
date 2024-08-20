import {
    TabPanel,
    Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    InputLeftElement,
    Image,
    Text,
    Grid,
    Flex,
    Box,
} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import { SmartContract } from "@/Backend/SmartContract";
import { AnyJson } from "@polkadot/types/types";
import VaraLogo from "@/assets/images/VaraLogo.png";
import Advertencia from "@/assets/images/icons/advertencia.svg";
import {useBalance} from "@gear-js/react-hooks";
import {AccountsModal} from "@/features/multiwallet/ui/accounts-modal";
import { formatDate } from "@/utils/date";

type UnstakeProps = {
    account: any;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    accounts: any;
    contractCalls: SmartContract;
};

export function Unstake({openModal, closeModal, account, accounts, isModalOpen, contractCalls }: UnstakeProps) {
    const {balance} = useBalance(account?.address);
    const [unstakeAmount, setUnstakeAmount] = useState("0");
    const [approveGas, setApproveGas] = useState(0);
    const [gvaraValance, setGvaraBalance] = useState(0);
    const [lockedBalance, setLockedBalance] = useState(0)
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);

    const maxAmountVaraUnstake = () => {
        if (gvaraValance > 0) {
            setUnstakeAmount(String(Number(gvaraValance)));
            setApproveGas(0.6 * 100000000000)
        }
    };

    const getBalance = useCallback(async () => {
        contractCalls.balanceOf().then((balance) => {
            setGvaraBalance(balance);
            setLockedBalance(balance);
        })
    }, [contractCalls])

    const unstakeVara = async () => {
        if (Number(unstakeAmount) > gvaraValance || Number(unstakeAmount) > lockedBalance || Number(unstakeAmount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }

        // FETCH TOKEN VALUE
        const tokenValue = await contractCalls.tokenValue();
        const unstakeValue = (Number(unstakeAmount) * (tokenValue / contractCalls.plat)) * contractCalls.plat;

        const payload: AnyJson = {
            Unstake: {
                amount: unstakeValue,
                date: formatDate(new Date()),
                liberationEra: await contractCalls.getCurrentEra() + 14,
            }
        }

        await contractCalls.unstake(payload, 0, unstakeValue);
    }

    useEffect(() => {
        getBalance().then();
    }, [getBalance, contractCalls, balance]);

    useEffect(() => { }, [approveGas, balance, gvaraValance]);

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

                        <Grid templateColumns="1fr auto" gap="1">
                            <Td position="revert">
                                <InputGroup size="lg">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        paddingTop="10px"
                                        w="90px"
                                    >
                                        <Text
                                            fontFamily="'Consolas', italic"
                                            color="turquoise"
                                        >
                                            g
                                        </Text>
                                        <Image src={VaraLogo} h="60px" w="60px" />
                                    </InputLeftElement>
                                    <Input
                                        paddingLeft="78px"
                                        w="700px"
                                        h="60px"
                                        type="text"
                                        borderColor="#F8AD30"
                                        borderRadius="20px"
                                        focusBorderColor="#F8AD18"
                                        color="white"
                                        backgroundColor="#131111"
                                        _hover={{
                                            borderColor: "#F8AD18",
                                        }}
                                        value={unstakeAmount}
                                        onChange={(event) => {
                                            const { value } = event.target;
                                            if (!Number.isNaN(Number(value))) {
                                                if (value.startsWith("0")) {
                                                    setUnstakeAmount(value.slice(1));
                                                } else {
                                                    setUnstakeAmount(value);
                                                }
                                                setApproveGas(0.6 * contractCalls.plat)
                                                setIsAmountInvalid(false);
                                            }
                                            if (Number(value) === 0) {
                                                setUnstakeAmount("0")
                                                setApproveGas(0)
                                            }
                                        }}
                                        borderWidth="3px"
                                        display="flex"
                                        alignContent="center"
                                    />
                                    <InputRightElement
                                        paddingRight="20px"
                                        paddingTop="10px"
                                    >
                                        <Button
                                            h="60px"
                                            size="lg"
                                            onClick={maxAmountVaraUnstake}
                                            backgroundColor="transparent"
                                            color="white"
                                            _hover={{
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            MAX
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </Td>
                        </Grid>

                        <Grid templateColumns="1fr auto" gap="1">
                            <Td isNumeric color="white" fontSize="md">
                                {isAmountInvalid && (
                                    <Text color="red" fontSize="sm">
                                        Invalid amount to perform transaction
                                    </Text>
                                )}
                                <Flex align="center" justifyContent="flex-end">
                                    <Image src={Advertencia} boxSize="30px" mr={2} />
                                    <Text>The gas fee will be: {String((approveGas / 1000000000000) * 2)} VARA currently</Text>
                                </Flex>
                            </Td>
                        </Grid>

                        <Grid templateColumns="1fr auto" gap="4">
                            <Tr textColor="white">
                                <Td
                                    fontSize="18px"
                                    fontWeight="bold"
                                    style={{ color: "white" }}
                                >
                                    You will receive
                                </Td>
                                <Td style={{ visibility: "hidden", color: "white" }}>
                                    .
                                </Td>
                            </Tr>
                            <Td
                                isNumeric
                                textAlign="end"
                                fontWeight="bold"
                                style={{ color: "white" }}
                                fontSize="18px"
                            >
                                {unstakeAmount} VARA
                            </Td>
                        </Grid>

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