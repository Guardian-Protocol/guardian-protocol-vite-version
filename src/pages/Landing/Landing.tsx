import {
    Box,
    Center,
    Flex,
    GridItem,
    Heading,
    HStack,
    Text,
    VStack,
    Button, Image
} from "@chakra-ui/react";
import {Link} from "react-router-dom";
import DotGrid from "../../assets/images/DotGrid.png"
import {HoverEffect} from "@/pages/Landing/HoverEffect";
import {Section2} from "@/pages/Landing/Section2";
import {Section3} from "@/pages/Landing/Section3";
import {Section4} from "@/pages/Landing/Section4";
import {Section5} from "@/pages/Landing/Section5";
import {useAccount} from "@gear-js/react-hooks";
import {AccountInfo} from "@/components/layout/header/account-info";
import {useEffect} from "react";

function Landing() {

    const { account } = useAccount();

    useEffect(() => {
        console.log(account)
    }, [account]);

    return (
        <>
            <GridItem h="630px" w="100%" bg="#F8AD18">
                <Center>
                    <HStack>
                        <Flex direction="row" gap="250">
                            <HStack>
                                <VStack align="start" spacing={5}>
                                    <Heading size="4xl" textColor="black" textAlign="left" fontWeight="semibold">
                                        Liquid Staking <br /> protocol
                                    </Heading>
                                    <Text textColor="black" fontSize="3xl">
                                      Securing and decentralizing
                                    </Text>
                                    <Heading>
                                        <Text>
                                            VARA NETWORK
                                        </Text>
                                    </Heading>
                                    <Box h="20px" />
                                    <Button
                                        as={Link}
                                        to="/home"
                                        size="lg"
                                        borderRadius="10"
                                        backgroundColor="black"
                                        textColor="white"
                                        variant="ghost"
                                        _hover={{ color: "gray.900"}}
                                        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                                        border="2px"
                                        borderColor="yellow.300"
                                        w="400px" >
                                        <Heading size="2x1">Stake now!</Heading>
                                    </Button>
                                </VStack>
                            </HStack>
                            <Box position="relative" w="39%" h="40%" >
                                <Box
                                    position="absolute"
                                    backgroundImage={`url(${DotGrid})`}
                                    backgroundRepeat="no-repeat"
                                    backgroundSize="150%"
                                    backgroundPosition="center"
                                    w="152%"
                                    h="105.20%"
                                    left="-24%"
                                    top="-1%"
                                />
                                <VStack>
                                    <Image
                                        position="revert"
                                        marginLeft="-400px"
                                        w="70px"
                                        h="70 px"
                                        src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                                        transform="rotate(-25deg)"
                                    />
                                    <HoverEffect />
                                    <Image
                                        position="revert"
                                        w="70px"
                                        h="70 px"
                                        src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                                        transform="rotate(-45deg)"
                                        marginLeft="400px"
                                  />
                                </VStack>
                            </Box>
                        </Flex>
                    </HStack>
                </Center>
            </GridItem>

            <GridItem h="600px" w="100%" bg="#F9B830" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Center>
                    <Section2/>
                </Center>
            </GridItem>

            <GridItem h="400px" w="100%" bg="#F9B830" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Center>
                    <Section3/>
                </Center>
            </GridItem>

            <GridItem h="820px" w="100%" bg="#F8AD18" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Center>
                    <Section4/>
                </Center>
            </GridItem>

            <GridItem h="300px" w="100%" bg="#F9B830" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Center>
                    <Section5/>
                </Center>
            </GridItem>
        </>
    );
}

export { Landing };
