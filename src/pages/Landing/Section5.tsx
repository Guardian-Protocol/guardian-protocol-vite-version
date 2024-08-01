import {motion, useAnimation} from "framer-motion";
import {useCallback, useEffect, useRef} from "react";
import {Box, Button, Divider, Grid, Heading, HStack, Icon, Image, VStack} from "@chakra-ui/react";
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

        if (scrollY + windowHeight > elementTop) {
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
        >
            <Grid templateColumns="repeat(3, 350px)" gap={1}>
                <VStack alignItems="center" spacing={14}>
                    <Heading size="lg" textColor="black">Networks</Heading>
                    <HStack justifyContent="center" spacing={10}>
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
                                h="75px"
                                w="75px"
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
                                h="75px"
                                w="75px"
                                _hover={{color: "gray.900"}}>
                            <Icon as={FaTwitter} boxSize="25px"/>
                        </Button>
                    </HStack>
                </VStack>
                <Divider orientation="vertical" borderColor="black" ml={160} height="170px"/>
                <VStack alignItems="center" spacing={5}>
                    <Heading size="lg" textColor="black">Supporters</Heading>
                    <HStack justifyContent="center" spacing={2}>
                        <Image w="140px" h="140px"
                               src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/Cryptomx-Logo.png?raw=true"/>
                        <Box w="15px"/>
                        <Image w="140px" h="140px"
                               src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/Vara-Logo.png?raw=true"/>
                        <Box w="15px"/>
                        <Image w="140px" h="140px"
                               src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/maguey-studioLogo.png?raw=true"/>
                    </HStack>
                </VStack>
            </Grid>
        </motion.div>
    )
}