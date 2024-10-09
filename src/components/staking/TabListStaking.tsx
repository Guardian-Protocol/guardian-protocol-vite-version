import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {SmartContract} from "@/services/SmartContract";
import {Stake} from "@/components/staking/Stake";
import {History} from "@/components/staking/History";
import { Unstake } from "./Unstake";
import { Withdraw } from "./Withdraw";

type TabListStakingProps = {
    account: any;
    accounts: any;
    contract: SmartContract;
    balanceChanged: any;
    setBalanceChanged: any
};

export function TabListStaking({account, accounts, contract, balanceChanged, setBalanceChanged}: TabListStakingProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => { }, [tabIndex, account, isModalOpen, accounts]);

    const handleTabChange = (index: any) => {
        setTabIndex(index);
    };

    return (
        <Tabs
            isFitted
            variant="enclosed"
            style={{ color: "white", border: "4px solid #F8AD18" }}
            w={{ base: "95%", md: "800px" }}
            backgroundColor="black"
            borderRadius="30px"
            onChange={handleTabChange}
            minHeight="490px"
        >
            <TabList mb="1em" h='auto' w='100%' display={'grid'} gridTemplateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18"
                    borderTopLeftRadius="24px"
                    borderTopRightRadius="0"
                    color="white"
                    backgroundColor="black"
                    fontSize={{base: 'sm', md: 'xl'}}
                    w='100%'
                >
                    Stake
                </Tab>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18"
                    borderRight="3px solid #F8AD18"
                    borderLeft="3px solid #F8AD18"
                    borderTopLeftRadius="0px"
                    borderTopRightRadius={{base: '24px', md: '0px'}}
                    color="white"
                    backgroundColor="black"
                    fontSize={{base: 'sm', md: 'xl'}}
                    w='100%'
                >
                    Unstake
                </Tab>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18"
                    borderRight={{base: '0px', md: "3px solid #F8AD18"}}
                    borderLeft={{base: '0px', md: "3px solid #F8AD18"}}
                    borderRadius="0"
                    color="white"
                    backgroundColor="black"
                    fontSize={{base: 'sm', md: 'xl'}}
                    w='100%'
                >
                    Withdraw
                </Tab>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderRight={{base: '0px', md: "3px solid #F8AD18"}}
                    borderLeft={{base: '3px solid #F8AD18', md: "0px"}}
                    borderBottom="3px solid #F8AD18 "
                    borderTopLeftRadius="0px"
                    borderTopRightRadius={{base: '0', md: '24px'}}
                    color="white"
                    backgroundColor="black"
                    fontSize={{base: 'sm', md: 'xl'}}
                    w='100%'
                >
                    History
                </Tab>
            </TabList>

            <TabPanels>
                <Stake
                    account={account}
                    isModalOpen={isModalOpen}
                    openModal={openModal}
                    closeModal={closeModal}
                    contract={contract}
                    balanceChanged={balanceChanged}
                    setBalanceChanged={setBalanceChanged}
                />

                <Unstake
                    account={account}
                    isModalOpen={isModalOpen}
                    openModal={openModal} closeModal={closeModal}
                    contract={contract}
                    balanceChanged={balanceChanged}
                    setBalanceChanged={setBalanceChanged}
                />

                <Withdraw contractCalls={contract} account={account} />
                <History contractCalls={contract} />
            </TabPanels>

        </Tabs>
    )
}