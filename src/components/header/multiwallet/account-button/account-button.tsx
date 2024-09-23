import { Heading } from "@/components/shared/heading";
import {Button, HStack} from "@chakra-ui/react";
import Identicon from "@polkadot/react-identicon";
import {buttonStyles} from "@gear-js/ui";

type Props = {
  name?: string;
  address: string;
  className?: string;
  onClick: () => void;
};

const AccountButton = ({ name, address, className, onClick }: Props) => {
  return (
      <Button backgroundColor="yellow.200" className={className} onClick={onClick} _hover={{ backgroundColor: 'yellow.300' }}>
        <Identicon value={address} className={buttonStyles.icon} theme="polkadot" size={28} style={{ marginRight: '10px' }}/>
        {name}
      </Button>
  );
};

export { AccountButton };
