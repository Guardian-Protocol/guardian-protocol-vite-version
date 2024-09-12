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
    Flex,
    Grid,
    Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {SmartContract} from "@/Backend/SmartContract";
import { AnyJson } from "@polkadot/types/types";
import VaraLogo from "@/assets/images/icons/ava-vara-black.svg";
import Advertencia from '@/assets/images/icons/advertencia.svg';
import {useBalance, useBalanceFormat} from "@gear-js/react-hooks";
import {AccountsModal} from "@/features/multiwallet/ui/accounts-modal";
import { formatDate } from "@/utils/date";

type StakeProps = {
    account: any;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    accounts: any;
    contract: SmartContract
};

export function Stake({account, isModalOpen, openModal, closeModal, accounts, contract }: StakeProps) {
    const {balance} = useBalance(account?.address);
    const { getFormattedBalance } = useBalanceFormat();
    const formattedBalance: { value: string; unit: string } | undefined = balance ? getFormattedBalance(balance) : undefined
    const [lockedBalance, setLockedBalance] = useState(0)
    const [stakeAmount, setStakeAmount] = useState("0");
    const [gas, setGas] = useState(0);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [valueAfterToken, setValueAfterToken] = useState(0);

    const maxAmountVara = async () => {
        if (Number(formattedBalance?.value) > 0 || formattedBalance?.value !== undefined) {
            const amount = Math.floor(Number(formattedBalance?.value) - 1);

            const tokenValue = await contract.tokenValue() / contract.plat;
            setValueAfterToken(contract.toFixed4(amount / tokenValue));

            const gas = await contract.getGassLimit({ 
                Stake: [
                    valueAfterToken * contract.plat, 
                    formatDate(new Date())
                ]
            }, valueAfterToken * contract.plat);

            setStakeAmount(String(Math.floor(Number(formattedBalance?.value) - 1)));
            setGas(Number(gas));
        }
    };

    const handleVaraStakeInputChange = async (event: any) => {
        const { value } = event.target;
        if (!Number.isNaN(Number(value))) {
            if (value.startsWith("0")) {
                setStakeAmount(value.slice(1));
            } else {
                setStakeAmount(value);
            }
            setIsAmountInvalid(false);

            const tokenValue = await contract.tokenValue() / contract.plat;
            setValueAfterToken(contract.toFixed4(Number(value) / tokenValue));
            
            const amount = valueAfterToken * contract.plat;
            const gas = await contract.getGassLimit({ 
                Stake: [
                    amount, 
                    formatDate(new Date())
                ] 
            }, amount);

            setGas(Number(gas));
        }
        if (value === "") {
            setStakeAmount("0");
            setGas(0);
        }
    }

    const stakeVara = async () => {
        if (Number(stakeAmount) > Math.floor(Number(formattedBalance?.value)) - 1 || Number(stakeAmount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }

        const stakeValue = valueAfterToken * contract.plat;
        console.log(stakeValue)
        console.log(Number(stakeValue) / contract.plat)

        const payload: AnyJson = {
            Stake: [
                stakeValue,
                formatDate(new Date())
            ]
        }
        await contract.stake(payload, stakeValue, Number(stakeAmount) * contract.plat, gas)
    }

    useEffect(() => {
        contract.balanceOf().then((gBalance) => {
            setLockedBalance(contract.toFixed4(gBalance));
        })        
    }, [contract, balance]);

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
                                Available: {formattedBalance?.value ? (Number(formattedBalance?.value)) : (String(0))} VARA
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
                                        <Image src={VaraLogo} h="30px" w="30px" />
                                    </InputLeftElement>
                                    <Input
                                        paddingLeft="70px"
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
                                        value={stakeAmount}
                                        onChange={handleVaraStakeInputChange}
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
                                            onClick={maxAmountVara}
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
                                    <Text>The gas fee will be: {String(gas / 100000000000)} VARA currently</Text>
                                </Flex>
                            </Td>
                        </Grid>

                        <Grid templateColumns="1fr auto" gap="1">
                            <Tr textColor="white">
                                <Td
                                    fontSize="18px"
                                    fontWeight="bold"
                                    style={{ color: "white" }}
                                >
                                    You will receive
                                </Td>
                                <Td style={{ visibility: "hidden" }}>.</Td>
                            </Tr>
                            <Td
                                isNumeric
                                textAlign="end"
                                fontWeight="bold"
                                style={{ color: "white" }}
                                fontSize="18px"
                            >
                                {valueAfterToken} gVARA
                            </Td>
                        </Grid>

                        <Tr style={{ visibility: "hidden" }}>
                            <Td>.</Td>
                            <Td>.</Td>
                            <Td isNumeric>.</Td>
                        </Tr>

                        <Grid templateColumns="1fr auto" gap="1">
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
                                {formattedBalance?.value ? (Number(formattedBalance?.value) + lockedBalance) : (String(0))}
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
                                {lockedBalance}
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
                                {formattedBalance?.value ? (Number(formattedBalance?.value)) : (String(0))}
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