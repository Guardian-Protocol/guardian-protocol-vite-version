import { motion } from "framer-motion";
import { Image } from "@chakra-ui/react";


function HoverEffect() {
    return (
        <motion.div whileHover={{ scale: 1.1 }}>
            <Image
                position="relative"
                w="440px"
                h="440px"
                src="https://github.com/Guardian-Protocol/imagenes_guardian_protocol/blob/main/src/CoinGuardian.png?raw=true"
            />
        </motion.div>
    );
}

export { HoverEffect };