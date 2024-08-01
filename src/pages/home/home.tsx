import {useEffect, useState} from "react";
import {useAccount, useAlert, useApi} from "@gear-js/react-hooks";
import {SmartContract} from "@/Backend/SmartContract";
import {Box, Center, GridItem} from "@chakra-ui/react";
import XBackground from "../../assets/images/XBackground.svg";
import {TabListStaking} from "@/components/layout/staking/TabListStaking";

function Home () {
    const { api } = useApi();
    const { accounts, account } = useAccount();
    const alert = useAlert();

    const contract = new SmartContract(api!, account!, accounts, alert);

    return (
        <Box background={"#131111"} boxShadow="md">
            <GridItem
                w="100%"
                minH="90.2vh"
                style={{
                    backgroundImage: `url(${XBackground})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Box h="90px" />
                <Center>
                    <TabListStaking
                        account={account}
                        accounts={accounts}
                        contract={contract}
                    />
                </Center>
                <Box h="90px" />
            </GridItem>
        </Box>
    );
}

export { Home };
