import {
    TabPanel,
    Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Button,
    Grid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SmartContract } from "@/services/SmartContract";
import { AnyJson } from "@polkadot/types/types";
import VaraLogo from "@/assets/images/icons/ava-vara-black.svg";
import {Account, useBalance, useBalanceFormat} from "@gear-js/react-hooks";
import {AccountsModal} from "@/components/header/multiwallet/accounts-modal";
import { formatDate } from "@/utils/date";
import { StakeTokenInput } from "../shared/TokenInput/StakeTokenInput";

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
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [valueAfterToken, setValueAfterToken] = useState(0);
    const [stakeAmount, setStakeAmount] = useState("0");
    const [gas, setGas] = useState(0);

    const formattedBalance: formatedBalance = balance ? getFormattedBalance(balance) : undefined

    const stakeVara = async () => {
        if (Number(stakeAmount) > Math.floor(Number(formattedBalance?.value)) - 1 || Number(stakeAmount) <= 0) {
            setIsAmountInvalid(true);
            return;
        }

        contract.loadingAlert("Staking VARA", 5000, () => {
            setIsButtonDisabled(false);

            setTimeout(() => {
                setIsButtonDisabled(true);
            }, 15000);
        });

        const stakeValue = contract.toPlank(valueAfterToken);
        const amount = contract.toPlank(Number(stakeAmount));

        const payload: AnyJson = {
            Stake: {
                amount: amount,
                gvara_amount: stakeValue,
                user: account.decodedAddress,
                date: formatDate(new Date()),
            }
        }
        await contract.stake(payload, amount, gas, () => {
            setBalanceChanged(!balanceChanged)
        })
    }

    useEffect(() => {
        contract.balanceOf().then((gBalance) => {
            setLockedBalance(contract.toFixed4(gBalance));
        })        
    }, [contract, balance, balanceChanged, isButtonDisabled, stakeAmount]);

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
                        <Grid templateColumns="1fr auto" gap="10">
                            <Tr
                                id="espacio"
                                style={{ marginBottom: "3px !important" }}
                            >
                                <Td fontSize={{base: '16px', md: '18px'}} style={{ color: "white" }}>
                                    Amount
                                </Td>
                                <Td style={{ visibility: "hidden" }}>.</Td>
                            </Tr>
                            <Td
                                fontSize={{base: '16px', md: '18px'}}
                                isNumeric
                                textAlign="end"
                                style={{ color: "white" }}
                                display={{base: 'block', md: 'flex'}}
                                whiteSpace={{base: 'pre-line', md: 'nowrap'}}
                            >
                                Available: {formattedBalance?.value ? (Number(formattedBalance?.value)) : (String(0))} VARA
                            </Td>
                        </Grid>

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
                                        opacity: isButtonDisabled ? 1.0 : 0.5
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