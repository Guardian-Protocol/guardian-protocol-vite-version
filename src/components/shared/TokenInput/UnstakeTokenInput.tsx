import { Button, Flex, Grid, Image, Input, InputGroup, InputLeftElement, InputRightElement, Td, Text, Tr } from "@chakra-ui/react";
import Advertencia from '@/assets/images/icons/advertencia.svg';

type formatedBalance = { value: string; unit: string } | undefined;

type StakeTokenInputProps = {
    tokenLogo: string;
    amount: string;
    isAmountInvalid: boolean;
    valueAfterToken: number;
    handleInputChange: any;
    handleMaxButtonPressed: any;
    tokenValue: number;
}

export function UnstakeTokenInput({
    tokenLogo, 
    isAmountInvalid,
    valueAfterToken,
    amount,
    handleInputChange,
    handleMaxButtonPressed,
    tokenValue
}: StakeTokenInputProps) {
    return (
        <>
            <Grid templateColumns="1fr auto" gap="1">
                <Td position="revert">
                    <InputGroup size="lg">
                        <InputLeftElement
                            pointerEvents="none"
                            paddingTop="10px"
                            w="90px"
                        >
                            <Text
                                fontFamily="'Consolas', italic"
                                color="turquoise"
                            >
                                g
                            </Text>
                            <Image src={tokenLogo} h="60px" w="60px" />
                        </InputLeftElement>
                        <Input
                            paddingLeft="78px"
                            w="700px"
                            h="60px"
                            type="text"
                            borderColor="#F8AD30"
                            borderRadius="20px"
                            focusBorderColor="#F8AD18"
                            color="white"
                            backgroundColor="#131111"
                            _hover={{
                                borderColor: "#F8AD18",
                            }}
                            value={amount}
                            onChange={handleInputChange}
                            borderWidth="3px"
                            display="flex"
                            alignContent="center"
                        />
                        <InputRightElement
                            paddingRight="20px"
                            paddingTop="10px"
                        >
                            <Button
                                h="60px"
                                size="lg"
                                onClick={handleMaxButtonPressed}
                                backgroundColor="transparent"
                                color="white"
                                _hover={{
                                    backgroundColor: "transparent",
                                }}
                            >
                                MAX
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </Td>
            </Grid>

            <Grid templateColumns="1fr auto" gap="1">
                <Td isNumeric color="white" fontSize="md">
                    {isAmountInvalid && (
                        <Text color="red" fontSize="sm">
                            Invalid amount to perform transaction
                        </Text>
                    )}
                    <Flex align="center" justifyContent="flex-end">
                        <Image src={Advertencia} boxSize="30px" mr={2} />
                        <Text>This transaction doesn't need sign and gas payment</Text>
                    </Flex>
                </Td>
            </Grid>

            <Grid templateColumns="1fr auto" gap="1">
                <Td
                    isNumeric
                    textAlign="end"
                    style={{ color: "white" }}
                    fontSize="15px"
                >
                    <Flex align="center" justifyContent="flex-end">
                        <Image src={Advertencia} boxSize="30px" mr={2} />
                        <Text> 1 VARA = {tokenValue} gVARA</Text>
                    </Flex>
                </Td>
            </Grid>

            <Grid templateColumns="1fr auto" gap="4">
                <Tr textColor="white">
                    <Td
                        fontSize="18px"
                        fontWeight="bold"
                        style={{ color: "white" }}
                    >
                        You will receive
                    </Td>
                    <Td style={{ visibility: "hidden", color: "white" }}>
                        .
                    </Td>
                </Tr>
                <Td
                    isNumeric
                    textAlign="end"
                    fontWeight="bold"
                    style={{ color: "white" }}
                    fontSize="18px"
                >
                    {valueAfterToken} VARA
                </Td>
            </Grid>
        </>
    )
}
