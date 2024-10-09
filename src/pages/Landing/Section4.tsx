import { motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { Box, Flex, Heading, VStack, Image, useMediaQuery } from "@chakra-ui/react";

export function Section4() {
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
        >
            <Flex
                direction={{ base: "column", md: "row" }}
                gap={{ base: 5, md: 100 }}
                align="center"
                justify="center"
            >
                <VStack align={{ base: "center", md: "start" }} textAlign={{ base: "center", md: "left" }}>
                    <Heading textColor="black" size={{base:'2xl', md:"3xl"}} fontWeight="semibold" ml={{base:'0', md:'90px'}}>
                        Unlock liquidity and earn more rewards!
                    </Heading>
                </VStack>
                <Image
                    w={{ base: "300px", md: "500px" }}
                    h={{ base: "300px", md: "500px" }}
                    src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/Guardian-Reward2.png?raw=true"
                />
            </Flex>
        </motion.div>
    );
}