import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {SmartContract} from "@/services/SmartContract";
import {Stake} from "@/components/stake/Stake";
import {Unstake} from "@/components/unstake/Unstake";
import {Withdraw} from "@/components/withdraw/Withdraw";
import {History} from "@/components/stake/History";

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
            w="800px"
            backgroundColor="black"
            borderRadius="30px"
            onChange={handleTabChange}
            minHeight="490px"
        >
            <TabList mb="1em" h="60px">
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18"
                    borderTopLeftRadius="24px"
                    borderTopRightRadius="0"
                    color="white"
                    backgroundColor="black"
                    fontSize="18px"
                >
                    Stake
                </Tab>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18"
                    borderRight="3px solid #F8AD18"
                    borderLeft="3px solid #F8AD18"
                    borderRadius="0"
                    color="white"
                    backgroundColor="black"
                    fontSize="18px"
                >
                    Unstake
                </Tab>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18"
                    borderRight="3px solid #F8AD18"
                    borderLeft="3px solid #F8AD18"
                    borderRadius="0"
                    color="white"
                    backgroundColor="black"
                    fontSize="18px"
                >
                    Withdraw
                </Tab>
                <Tab
                    _selected={{ bg: "#F8AD18", color: "black" }}
                    borderBottom="3px solid #F8AD18 "
                    borderTopLeftRadius="0px"
                    borderTopRightRadius="24px"
                    color="white"
                    backgroundColor="black"
                    fontSize="18px"
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
                    accounts={accounts}
                    contract={contract}
                    balanceChanged={balanceChanged}
                    setBalanceChanged={setBalanceChanged}
                />

                <Unstake
                    account={account}
                    isModalOpen={isModalOpen}
                    openModal={openModal} closeModal={closeModal}
                    accounts={accounts}
                    contractCalls={contract}
                    balanceChanged={balanceChanged}
                    setBalanceChanged={setBalanceChanged}
                />

                <Withdraw contractCalls={contract} account={account} />
                <History contractCalls={contract} />
            </TabPanels>

        </Tabs>
    )
}