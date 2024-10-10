import {Button, HStack} from "@chakra-ui/react";
import Identicon from "@polkadot/react-identicon";
import {buttonStyles} from "@gear-js/ui";
import { useEffect, useState } from "react";

type Props = {
  name?: string;
  address: string;
  className?: string;
  onClick: () => void;
};

const AccountButton = ({ name, address, className, onClick }: Props) => {

  const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
        setIsScreenSmall(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
      <Button backgroundColor="yellow.200" className={className} onClick={onClick} _hover={{ backgroundColor: 'yellow.300' }}>
        <Identicon value={address} className={buttonStyles.icon} theme="polkadot" size={28} style={isScreenSmall?{margin:'0'}:{margin:'10px'}}/>
        {isScreenSmall ? null : name}
      </Button>
  );
};

export { AccountButton };
