import {
    TabPanel,
    Text,
    Button,
    Image,
    Box,
    Flex,
    Progress
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SmartContract } from "@/services/SmartContract";
import VaraLogo from "@/assets/images/VaraLogo.png";
import {Account, useBalance} from "@gear-js/react-hooks";
import { WithdrawRequest } from "@/services/models/WithdrawRequest";


import { KeyringPair } from '@polkadot/keyring/types';
import { decodeAddress } from "@gear-js/api";
import { 
    useVoucherUtils,
    useSignlessUtils 
} from "@/app/hooks";
import { getStorage, sleep } from "@/app/utils";
import { Modal } from "../shared/modal";

type WithdrawProps = {
    contractCalls: SmartContract;
    account: Account
};

export function Withdraw({contractCalls, account}: WithdrawProps) {
    const sponsorName = import.meta.env.VITE_SPONSOR_NAME;
    const sponsorMnemonic = import.meta.env.VITE_SPONSOR_MNEMONIC;
    const { balance } = useBalance(account?.address)
    const [unestakeHistory, setUnestakeHistory] = useState<any[]>([]);
    const [currentEra, setCurrentEra] = useState<number>(0);
    const [isHistoryEmpty, setIsHistoryEmpty] = useState<boolean>(false);
    const [update, setUpdate] = useState<boolean>(false);
    const [progressStatus, setProgressStatus] = useState(0);
    const [modalSubtitle, setModalSubtitle] = useState("Generating vouchers...");
    const [modalOpen, setIsModalOpen] = useState(false);

    const {
        pair,
        voucher,
        storageVoucher,
        createNewSession,
        unlockPair
    } = useSignlessUtils(contractCalls, null);

    const { checkVoucherForUpdates, vouchersInContract } = useVoucherUtils(sponsorName, sponsorMnemonic);

    const handleWithdraw = async (unestakeId: number, amount: number, liberationEra: number, index: number) => {
        let pair_data: [KeyringPair | undefined, `0x${string}` | undefined] = [undefined, undefined];

        let storagePair = getStorage()[account.address];

        setIsModalOpen(true);

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
                    contractCalls.getContractAddress,
                    decodeAddress(pairToUse.address)
                  ))[0];

            pair_data = [ pairToUse, voucherId ];

            await contractCalls.checkSession(pairToUse, account.decodedAddress);
        }

        setModalSubtitle("Updating voucher ...");
        setProgressStatus(55);

        await checkVoucherForUpdates(
            decodeAddress(pair_data[0]?.address!),
            pair_data[1]!,
            // 10,
            // 1_200,
            // 3,
            // () => {},
            // () => {}
        );

        const payload: WithdrawRequest = {
            user: contractCalls.currentUser()?.decodedAddress!,
            id: unestakeId,
            liberationEra: liberationEra,
            amount: amount
        }

        setModalSubtitle("Withdrawn tokens ...");
        setProgressStatus(75);

        await contractCalls.withdraw(
            payload,
            pair_data[0]!,
            pair_data[1]!
        );

        setModalSubtitle("Finished!");
        setProgressStatus(100);

        await sleep(2);
        
        setModalSubtitle("");
        setProgressStatus(0);
        setIsModalOpen(false);

        setTimeout(() => {
            setUpdate(!update);
        }, 3000);

        unestakeHistory.splice(index, 1);
    }

    useEffect(() => {
        contractCalls.getUnstakeHistory().then((history) => {
            setUnestakeHistory(history);
        });

        contractCalls.getCurrentEra().then((era) => {
            setCurrentEra(era);
        });

    }, [contractCalls, balance]);

    useEffect(() => {}, [update]);

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
            <Box w="100%" h="100%" mb='8'>
                <Flex direction="column" w="100%">
                    {unestakeHistory.map((history, index) => (
                        <Box
                            key={`${history.unestakeId}-${index}`}
                            borderWidth="3px"
                            borderRadius="lg"
                            overflow="hidden"
                            w="100%"
                            borderColor="#F8AD18"
                            bg="#131111"
                            mt={index > 0 ? 4 : 0}
                        >
                            <Flex justify="space-arount" p={5} align="center" w="100%">
                                <Flex direction={{base:'column', md: 'row'}} align="right" w="100%" justify="space-around">
                                    <Flex justifyContent={'space-between'} gap={5}>
                                        <Flex align="center">
                                            <Text  fontWeight="bold">Reward </Text>
                                        </Flex>
                                        
                                        <Flex align="center">
                                            <Text fontWeight="bold">{history?.reward / contractCalls.PLANK}</Text>
                                            <Image src={VaraLogo} boxSize="40px" ml={2} />
                                        </Flex>
                                    </Flex>

                                    <Flex justifyContent={'space-between'} gap={5}>
                                        <Flex align="center">
                                            <Text  fontWeight="bold">days to unlock </Text>
                                        </Flex>

                                        <Flex align="center">
                                            
                                            <Text  fontWeight="bold">
                                                {Math.max(0, ((history?.liberation_era - currentEra) * 12) / 24)}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                    <Flex justifyContent={'space-around'} mt={{base:'30px', md: '0'}}>
                                        <Button
                                            onClick={() =>{
                                                if (currentEra > history?.liberationEra) {
                                                    handleWithdraw(
                                                        history?.unestakeId, 
                                                        history?.amount, 
                                                        history?.liberationEra,
                                                        index
                                                    );
                                                } else {
                                                    contractCalls.errorAlert("You can't claim this yet");
                                                }
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
                                </Flex>
                            </Flex>
                        </Box>
                    ))}
                </Flex>
            </Box>
        </TabPanel>
    )
}