import styles from './ApiLoader.module.scss';
import {Box, GridItem} from "@chakra-ui/react";

function ApiLoader() {
  return (
      <Box backgroundColor={"#131111"}>
        <GridItem w="100%" minH="90.2vh" >
          <p className={styles.loader}>Initializing API</p>
        </GridItem>
      </Box>
  );
}

export {ApiLoader};
