import {motion, useAnimation} from "framer-motion";
import {useCallback, useEffect, useRef} from "react";
import {Box, Button, Divider, Grid, Heading, HStack, Icon, Image, VStack, Flex, SimpleGrid} from "@chakra-ui/react";
import {Link} from "react-router-dom";
import {FaGithub, FaTwitter} from "react-icons/fa6";

export function Section5() {
    const controls = useAnimation();
    const ref: any = useRef();

    const handleScroll = useCallback(async () => {
        const element = ref.current
        const { scrollY } = window;
        const elementTop = element.offsetTop;
        const windowHeight = window.innerHeight;

        if (scrollY + windowHeight > elementTop - 200) {
            await controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
        } else {
            await controls.start({ opacity: 0, y: 100 });
        }
    }, [controls])

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    return (
        <motion.div
            ref={ref}
            initial={{opacity: 0, y: 100}}
            animate={controls}
            className="scroll-appear-element"
            style={{width: "100%"}}
        >
            <Box w={{base: '100%', md: 'auto'}} marginLeft={'auto'} marginRight={'auto'}>
                <Grid w={'100%'} templateColumns={{base:"repeat(3, 32%)", md: "repeat(3, 350px)"}} gap={1}>
                    <VStack alignItems="center">
                        <Heading size="lg" textColor="black">Networks</Heading>
                        <Flex w='100%' h='100%' direction={{base: 'column', md: 'row'}} justifyContent="space-around" alignItems={'center'}>
                            <Button className="fade-in"
                                    as={Link}
                                    to="https://github.com/Guardian-Protocol/GuardianProtocol"
                                    size="lg"
                                    borderRadius="full"
                                    backgroundColor="black"
                                    transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                                    border="2px"
                                    borderColor="yellow.300"
                                    textColor="white"
                                    h={{base: '50px', md: '75px'}}
                                    w={{base: '30px', md: '75px'}}
                                    _hover={{color: "gray.900"}}>
                                <Icon as={FaGithub} boxSize="25px"/>
                            </Button>
                            <Button as={Link}
                                    to="https://x.com/guardiandefi?s=21&t=dZnUyTL5rfjf5OpZTlQW0g"
                                    size="lg"
                                    borderRadius="full"
                                    backgroundColor="black"
                                    transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                                    border="2px"
                                    borderColor="yellow.300"
                                    textColor="white"
                                    h={{base: '50px', md: '75px'}}
                                    w={{base: '30px', md: '75px'}}
                                    _hover={{color: "gray.900"}}>
                                <Icon as={FaTwitter} boxSize="25px"/>
                            </Button>
                        </Flex>
                    </VStack>
                    <Divider orientation="vertical" borderColor="black" ml={'50%'} height="100%"/>
                    <VStack alignItems="center" spacing={5}>
                        <Heading size="lg" textColor="black">Supporters</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2} justifyContent="center">
                            <Image
                                w={{ base: "50px", md: "120px" }}
                                h={{ base: "50px", md: "120px" }}
                                src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/Cryptomx-Logo.png?raw=true"
                            />
                            <Image
                                w={{ base: "50px", md: "120px" }}
                                h={{ base: "50px", md: "120px" }}
                                src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/Vara-Logo.png?raw=true"
                            />
                            <Image
                                w={{ base: "50px", md: "120px" }}
                                h={{ base: "50px", md: "120px" }}
                                src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/maguey-studioLogo.png?raw=true"
                            />
                        </SimpleGrid>
                    </VStack>
                </Grid>
            </Box>
        </motion.div>
    )
}