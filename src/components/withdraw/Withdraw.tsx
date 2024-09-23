import {
    TabPanel,
    Text,
    Button,
    Image,
    Box,
    Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SmartContract } from "@/services/SmartContract";
import VaraLogo from "@/assets/images/VaraLogo.png";
import {Account, useBalance} from "@gear-js/react-hooks";

type WithdrawProps = {
    contractCalls: SmartContract;
    account: Account
};

export function Withdraw({contractCalls, account}: WithdrawProps) {
    const { balance } = useBalance(account?.address)
    const [unestakeHistory, setUnestakeHistory] = useState<any[]>([]);
    const [currentEra, setCurrentEra] = useState<number>(0);
    const [isHistoryEmpty, setIsHistoryEmpty] = useState<boolean>(false);

    const handleWithdraw = async (unestakeId: number, amount: number, liberationEra: number) => {
        await contractCalls.withdraw(unestakeId, amount, liberationEra);
    }

    useEffect(() => {
        contractCalls.getUnstakeHistory().then((history) => {
            if(history !== 0) {

                console.log(history.length)

                if (history.length < 0) {
                    setIsHistoryEmpty(true);
                }

                console.log(history)
                setUnestakeHistory(history)
            }
        });

        contractCalls.getCurrentEra().then((era) => {
            setCurrentEra(era);
        });
    }, [contractCalls, balance])


    if (unestakeHistory.length === 0 || isHistoryEmpty) {
        return (
            <TabPanel
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Text fontSize="lg" fontWeight="bold">There is no unstakes</Text>
            </TabPanel>
        );
    }

    return (
        <TabPanel
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflowY="auto"
            h="500px"
            margin={"10px"}
        >
            <Flex direction="column" w="100%">
                {unestakeHistory.map((history, index) => (
                    <Box
                        key={history.unestakeId}
                        borderWidth="3px"
                        borderRadius="lg"
                        overflow="hidden"
                        w="100%"
                        borderColor="#F8AD18"
                        bg="#131111"
                        mt={index > 0 ? 4 : 0}
                    >
                        <Flex justify="space-between" p={5} align="center" w="100%">
                            <Flex align="center" w="70%" justify="space-between">
                                <Flex direction="column" justify="space-between">
                                    <Flex align="center">
                                        <Text fontSize="lg" fontWeight="bold">Request Amount </Text>
                                    </Flex>
                                    <Flex align="center">
                                        <Text fontSize="lg" fontWeight="bold">Remaining days </Text>
                                    </Flex>
                                </Flex>
                                <Flex direction="column" alignItems="flex-end">
                                    <Flex align="center">
                                        <Text fontSize="lg" fontWeight="bold">{history?.amount / contractCalls.plat}</Text>
                                        <Image src={VaraLogo} boxSize="40px" ml={2} />
                                    </Flex>
                                    <Flex align="center">
                                        <Text fontSize="lg" fontWeight="bold">
                                            {Math.max(0, ((history?.liberationEra - currentEra) * 12) / 24)}
                                        </Text>
                                        <Text ml={4} fontSize="lg" fontWeight="bold">days</Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Button
                                onClick={async () =>{
                                    if (currentEra > history?.liberationEra) {
                                        await handleWithdraw(history?.unestakeId, history?.amount, history?.liberationEra);
                                    } else {}
                                }}
                                colorScheme="teal"
                                size="lg"
                                style={{
                                    color: "black",
                                    background: (currentEra > history?.liberationEra) ? "#F8AD18" : "rgba(252,187,68,0.22)",
                                    width: "140px",
                                }}
                            >
                                Claim
                            </Button>
                        </Flex>
                    </Box>
                ))}
            </Flex>

        </TabPanel>
    )
}