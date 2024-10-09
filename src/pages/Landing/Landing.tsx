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
import {useEffect} from "react";

function Landing({setBalanceChanged, balanceChanged}: any) {

    const { account } = useAccount();

    useEffect(() => {
        console.log(account)
    }, [account]);

    return (
        <>
            <GridItem h={{base:"auto", md:"630px"}} pb={{base:'10', md:'0'}} w="100%" bg="#F8AD18" overflow={'hidden'}>
                <Center>
                    <HStack>
                        <Flex
                            direction={{ base: "column", md: "row" }}
                            gap={{ base: "10", md: "250" }}
                        >
                            <HStack>
                                <VStack align="start" spacing={5} p={{base: '5', md: '0'}}>
                                    <Heading size={{base:'2xl', md:'4xl'}} textColor="black" textAlign="left" fontWeight="semibold">
                                        Liquid Staking <br /> protocol
                                    </Heading>
                                    <Text textColor="black" fontSize={{base:'lg', md:'3xl'}}>
                                      Securing and decentralizing
                                    </Text>
                                    <Heading>
                                        <Text fontSize={{base:'lg', md:'4xl'}}>
                                            VARA NETWORK
                                        </Text>
                                    </Heading>
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
                                        w="90%"
                                        marginLeft='auto'
                                        marginRight='auto'
                                        marginTop={{base:'5', md:'20'}}
                                        >
                                        <Heading size="2x1">Stake now!</Heading>
                                    </Button>
                                </VStack>
                            </HStack>
                            <Box position="relative" w={{ base: "90%", md: "39%" }} h={{ base: "60%", md: "40%" }}>
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
                                        marginLeft={{ base: "-30vh", md: "-400px" }}
                                        w={{ base: "50px", md: "70px" }}
                                        h={{ base: "50px", md: "70px" }}
                                        src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                                        transform="rotate(-25deg)"
                                    />
                                    <HoverEffect />
                                    <Image
                                        position="revert"
                                        w={{ base: "50px", md: "70px" }}
                                        h={{ base: "50px", md: "70px" }}
                                        src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                                        transform="rotate(-45deg)"
                                        marginLeft={{ base: "30vh", md: "400px" }}
                                    />
                                </VStack>
                            </Box>
                        </Flex>
                    </HStack>
                </Center>
            </GridItem>

            <GridItem h={{base: 'auto', md: '600px'}} w="100%" bg="#F9B830" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Center>
                    <Section2/>
                </Center>
            </GridItem>

            <GridItem h={{base: 'auto', md: '400px'}} pb='30px' w="100%" bg="#F9B830" style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
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
