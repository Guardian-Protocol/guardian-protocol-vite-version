import {useAccount, useAlert, useApi} from "@gear-js/react-hooks";
import {SmartContract} from "@/services/SmartContract";
import {Box, Center, GridItem} from "@chakra-ui/react";
import XBackground from "../../assets/images/XBackground.svg";
import {TabListStaking} from "@/components/staking/TabListStaking";

function Home ({setBalanceChanged, balanceChanged}: any) {
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
                        setBalanceChanged={setBalanceChanged}
                        balanceChanged={balanceChanged}
                    />
                </Center>
                <Box h="90px" />
            </GridItem>
        </Box>
    );
}

export { Home };
