import { motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { Box, Flex, Heading, HStack, Image, useMediaQuery } from "@chakra-ui/react";

export function Section2() {
    const controls = useAnimation();
    const ref: any = useRef();
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

    const handleScroll = useCallback(async () => {
        const element = ref.current;
        const { scrollY } = window;
        const elementTop = element.offsetTop;
        const windowHeight = window.innerHeight;

        if (scrollY + windowHeight > elementTop) {
            await controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
        } else {
            await controls.start({ opacity: 0, y: 100 });
        }
    }, [controls]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 100 }}
            animate={controls}
            className="scroll-appear-element"
            style={{ display: "flex", justifyContent: "center", alignItems: "center",  paddingTop: "30px", paddingBottom: "30px" }}
        >
            <HStack>
                <Flex gap="10px">
                    {isLargerThan768 && (
                        <Image
                            w="380px"
                            h="380px"
                            src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
                        />
                    )}
                    <HStack>
                        {
                            isLargerThan768 && (
                                <Box w='150px'/>
                            )
                        }
                        <Heading size={{base:'xl', md:'3xl'}} textColor="black">How Guardian works?</Heading>
                    </HStack>
                </Flex>
            </HStack>
        </motion.div>
    );
}