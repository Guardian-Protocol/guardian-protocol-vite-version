import { motion, useAnimation } from "framer-motion";
import {useCallback, useEffect, useRef} from "react";
import {Flex, Heading, HStack, Image} from "@chakra-ui/react";

export function Section3() {
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
            <HStack>
                <Flex gap={9} direction={{base: 'column', md: 'row'}} alignItems={{base:'center', md:'normal'}}>
                    <HStack gap={5}>
                        <Image
                            w={{base:'70px', md:'180px'}}
                            h={{base:'70px', md:'180px'}}
                            src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                        />
                        <Heading size={{base:'md', md: 'lg'}} w={{base:'30vh', md:'auto'}} pl={{base:'3vh', md:'0'}}  textColor="black" fontWeight="normal">
                            Stake $VARA <br/> tokens protocols
                        </Heading>
                    </HStack>
                    <HStack gap={5}>
                        <Image
                            w={{base:'70px', md:'180px'}}
                            h={{base:'70px', md:'180px'}}
                            src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                        />
                        <Heading size={{base:'md', md: 'lg'}} textColor="black" w={{base:'30vh', md:'auto'}} pl={{base:'3vh', md:'0'}}  fontWeight="normal">
                            Receive liquid <br/> $gVARA tokens
                        </Heading>
                    </HStack>
                    <HStack>
                        <Image
                            w={{base:'70px', md:'180px'}}
                            h={{base:'70px', md:'180px'}}
                            src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                        />
                        <Heading size={{base:'md', md: 'lg'}} w={{base:'30vh', md:'auto'}} pl={{base:'3vh', md:'0'}} textColor="black" fontWeight="normal">Participate <br/> across DeFi
                        </Heading>
                    </HStack>
                </Flex>
            </HStack>
        </motion.div>
    );
}