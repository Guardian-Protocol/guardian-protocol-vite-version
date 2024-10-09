import React from 'react';
import styles from './header.module.scss';
import {Link} from "react-router-dom";
import {Box, Image, Flex} from "@chakra-ui/react";
import GuardianLogo from '../../assets/images/GuardianBlack.png';
import { MultiWallet } from './multiwallet';

export function Header({balanceChanged}: any) {  
  return (
      <header className={styles.header}>
          <Flex justifyContent={'space-between'} w="100%" pl={{base:30, md: 90}} pr={{base:30, md: 90}} pb={4} pt={4} className={styles.header}>
              <h1>
                  <Link to="/">
                      <Image src={GuardianLogo} width={{base:'90px', md:'140px'}} alt="Logo" className={styles.logo}/>
                  </Link>
              </h1>
              <MultiWallet balanceChanged={balanceChanged} />
          </Flex>
      </header>
  );
}
