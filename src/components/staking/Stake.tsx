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
import { AnyJson } from "@polkadot/types/types";
import VaraLogo from "@/assets/images/icons/ava-vara-black.svg";
import {Account, useBalance, useBalanceFormat} from "@gear-js/react-hooks";
import {AccountsModal} from "@/components/header/multiwallet/accounts-modal";
import { formatDate } from "@/utils/date";
import { StakeTokenInput } from "../shared/TokenInput/StakeTokenInput";
import { StakeRequest } from "@/services/models/StateRequest";

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

    const { getFormattedBalance } = useBalanceFormat();
    const { balance } = useBalance(account?.address);
    const [lockedBalance, setLockedBalance] = useState(0)
    const [isButtonEnabled, setIsButtonEnabled] = useState(true);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [valueAfterToken, setValueAfterToken] = useState(0);
    const [stakeAmount, setStakeAmount] = useState("0");
    const [gas, setGas] = useState(0);

    const formattedBalance: formatedBalance = balance ? getFormattedBalance(balance) : undefined

    const stakeVara = async () => {
        if (!isButtonEnabled) return;

        if (Number(stakeAmount) > Math.floor(Number(formattedBalance?.value)) - 1 || Number(stakeAmount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }

        setIsButtonEnabled(false);
        let id = contract.loadingAlert("Staking VARA - Dont leave the page");

        const stakeValue = contract.toPlank(valueAfterToken);
        const amount = contract.toPlank(Number(stakeAmount));

        const payload: StakeRequest = {
            amount: amount,
            tokenAmount: stakeValue,
            user: contract.currentUser()?.decodedAddress!!,
            date: formatDate(new Date()),
        }

        try {
            await contract.stake(payload, () => {
                setIsButtonEnabled(true);
                contract.closeAlert(id);
                setStakeAmount("0");
                setValueAfterToken(0);

                setTimeout(() => {
                    setBalanceChanged(!balanceChanged);
                }, 3500);
            });
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
                                Available: {formattedBalance?.value ? (Number(formattedBalance?.value)) : (String(0))} VARA
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
                                {formattedBalance?.value ? (contract.toFixed4(Number(formattedBalance?.value) + lockedBalance)) : (String(0))}
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