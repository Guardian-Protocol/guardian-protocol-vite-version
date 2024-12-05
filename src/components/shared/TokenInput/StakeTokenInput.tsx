import { Button, Flex, Grid, Image, Input, InputGroup, InputLeftElement, InputRightElement, Td, Text, Tr } from "@chakra-ui/react"
import Advertencia from '@/assets/images/icons/advertencia.svg';
import { useEffect, useState } from "react";
import { SmartContract } from "@/services/SmartContract";
import { formatDate } from "@/utils/date";

type formatedBalance = { value: string; unit: string } | undefined;

type StakeTokenInputProps = {
    tokenLogo: string;
    amount: string;
    setAmount: any;
    contract: SmartContract;
    isAmountInvalid: boolean;
    formattedBalance: formatedBalance;
    setIsAmountInvalid: any;
    valueAfterToken: number;
    setValueAfterToken: any;
    gas: number;
    setGas: any;
}

export function StakeTokenInput({
    tokenLogo, 
    amount, 
    setAmount, 
    contract,
    isAmountInvalid,
    formattedBalance,
    setIsAmountInvalid,
    valueAfterToken,
    setValueAfterToken,
    gas,
    setGas
}: StakeTokenInputProps) {

    const [fetchTokenValue, setFetchTokenValue] = useState(0);
    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 768);

    const handleInputChange = async (e: any) => {
        const { value } = e.target;
        if (Number.isNaN(Number(value))) {
            return;
        }

        if (value === "") {
            setGas(0);
            setAmount("0");
            setValueAfterToken(0);
            return;
        }

        if (value.length === 0) {
            setAmount("0");
            setGas(0);
            setValueAfterToken(0);
            return;
        }

        setIsAmountInvalid(false);
        setAmount((value.startsWith("0")) ? value.slice(1) : value);
        const tokenValue = await contract.tokenValue();
        setValueAfterToken(contract.toFixed4(Number(value) / tokenValue));

        const stakeValue = valueAfterToken * contract.PLANK;
        const amount = Number(value) * contract.PLANK;
        const payload = {
            amount: amount,
            gvaraAmount: stakeValue,
            date: formatDate(new Date()),
        }

        setGas(Number(await contract.stakeGas(payload)));
    }

    const handleMaxPressed = async (e: any) => {
        if (Number(formattedBalance?.value) > 0 || formattedBalance?.value !== undefined) {
            let amount = Math.floor(Number(formattedBalance?.value) - 1);
            setAmount(String(amount));

            const tokenValue = await contract.tokenValue();
            setValueAfterToken(contract.toFixed4(amount / tokenValue));

            const stakeValue = valueAfterToken * contract.PLANK;
            amount = amount * contract.PLANK;

            const payload = {
                amount: amount,
                gvaraAmount: stakeValue,
                date: formatDate(new Date()),
            }
  
            setGas(Number(await contract.stakeGas(payload)));
        }
    }

    useEffect(() => {
        contract.tokenValue().then((value) => {
            setFetchTokenValue(value);
        });

        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handleMediaQueryChange = (e: MediaQueryListEvent) => {
            setIsScreenSmall(e.matches);
        };

        mediaQuery.addEventListener("change", handleMediaQueryChange);

        return () => {
            mediaQuery.removeEventListener("change", handleMediaQueryChange);
        };
    }, [fetchTokenValue]);

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
                            <Image src={tokenLogo} h="30px" w="30px" />
                        </InputLeftElement>
                        <Input
                            paddingLeft="70px"
                            paddingRight="60px"
                            w={{base: "100%", md: "700px"}}
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
                                onClick={handleMaxPressed}
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
                        <Text
                            display={{base: 'block', md: 'flex'}}
                            whiteSpace={{base: 'pre-line', md: 'nowrap'}}
                        >The gas fee will be: {String(gas / 100000000000)} VARA currently</Text>
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
                        <Text> 1 VARA = {fetchTokenValue} gVARA</Text>
                    </Flex>
                </Td>
            </Grid>

            {isScreenSmall ? (
                <>
                    <Grid templateColumns="1fr auto" gap="1" mt='10px'>
                        <Tr textColor="white">
                            <Td
                                fontSize="18px"
                                fontWeight="bold"
                                style={{ color: "white" }}
                            >
                                You will receive: 
                            </Td>
                        </Tr>
                    </Grid>
                    <Tr w='100%' justifyContent={'flex-end'} display={'flex'}>
                        <Td
                            isNumeric
                            flex={1}
                            textAlign="end"
                            fontWeight="bold"
                            style={{ color: "white" }}
                            fontSize="18px"
                            w={{base: '100%', md: 'auto'}}
                        >
                            {valueAfterToken} gVARA
                        </Td>
                    </Tr>
                </>
            ) : (
                <>
                <Grid templateColumns="1fr auto" gap="1">
                    <Tr textColor="white">
                        <Td
                            fontSize="18px"
                            fontWeight="bold"
                            style={{ color: "white" }}
                        >
                            You will receive
                        </Td>
                        <Td style={{ visibility: "hidden" }}>.</Td>
                    </Tr>
                    <Td
                            isNumeric
                            textAlign="end"
                            fontWeight="bold"
                            style={{ color: "white" }}
                            fontSize="18px"
                            w={{base: '100%', md: 'auto'}}
                        >
                            {valueAfterToken} gVARA
                    </Td>
                </Grid>
                <Tr style={{ visibility: "hidden" }}>
                    <Td>.</Td>
                    <Td>.</Td>
                    <Td isNumeric>.
                    </Td>
                </Tr>
            </>
            )}
        </>
    )
}