import {
    TabPanel,
    Text,
    Image,
    Box,
    Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { SmartContract } from "@/services/SmartContract";
import VaraLogo from "@/assets/images/VaraLogo.png";

type HistoryProps = {
    contractCalls: SmartContract;
};

export function History({contractCalls}: HistoryProps) {
    const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

    contractCalls.getHistory().then((history) => {
        setTransactionHistory(history);
    });

    if (transactionHistory?.length === 0) {
        return (
            <TabPanel
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Text fontSize="lg" fontWeight="bold">You have no transaction history</Text>
            </TabPanel>
        );
    }

    return (
        <TabPanel
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflow={"auto"}
            h="500px"
            margin={"10px"}
        >
            <Box w='100%' h="100%" mb='8'>
                <Flex direction="column" w="100%">
                    {transactionHistory.map((history, index) => (
                        <Box key={history.transactionTime} borderWidth="3px" borderRadius="lg" overflow="hidden" w="100%" borderColor="#F8AD18" bg="#131111" mt={index > 0 ? 4 : 0}>
                            <Flex justify="space-between" p={5} align="center" direction={{base: 'column', md: 'row'}} w="100%">
                                <Flex align="center" w={{base: '100%', md: '70%'}} justify="space-between">
                                    <Flex direction="column" justify="space-between">
                                        <Flex align="center">
                                            <Text fontSize={{base: 'md', md: 'lg'}} fontWeight="bold">Guardian protocol transaction</Text>
                                        </Flex>
                                    </Flex>
                                    <Flex direction="column" alignItems="flex-end">
                                        <Flex align="center">
                                            <Text fontSize={{base: 'md', md: 'lg'}} fontWeight="bold">{history.amount / contractCalls.PLANK}</Text>
                                            <Image src={VaraLogo} boxSize="40px" ml={2} />
                                        </Flex>
                                    </Flex>
                                </Flex>
                                <Flex direction={{base:'row', md:'row'}} w={{base:'100%', md:'60%'}}  mt={{base: '10px', md: 0}}>
                                    <Flex align="center" w={{base: '50%', md:"50%"}} justifyContent="center">
                                        <Text fontSize={{base: 'md', md: 'lg'}} fontWeight="bold">{history.date}</Text>
                                    </Flex>
                                    <Flex align="center" w={{base: '50%', md:"50%"}} justifyContent="center">
                                        {history.t_type === "stake" ?
                                            (<Text fontSize={{base: 'md', md: 'lg'}} fontWeight="bold">STAKE</Text>) : (<Text fontSize="lg" fontWeight="bold">UNSTAKE</Text>)
                                        }
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Box>
                    ))}
                </Flex>
            </Box>
        </TabPanel>
    )
}
