import React from 'react';
import styles from './header.module.scss';
import {Link} from "react-router-dom";
import {Box, Image} from "@chakra-ui/react";
import GuardianLogo from '../../../assets/images/GuardianBlack.png';
import {MultiWallet} from "@/features/multiwallet/ui/wallet";

export function Header() {
  return (
      <header className={styles.header}>
          <Box w="100%" pl={90} pr={90} pb={4} pt={4} className={styles.header}>
              <h1>
                  <Link to="/">
                      <Image src={GuardianLogo} width='140px' alt="Logo" className={styles.logo}/>
                  </Link>
              </h1>
              <MultiWallet />
          </Box>
      </header>
  );
}
