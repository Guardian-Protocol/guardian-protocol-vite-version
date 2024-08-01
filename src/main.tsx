import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import dotenv from "dotenv";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

dotenv.config();

const colors = {
  body: {
    scrollbarWidth: 'thin',
    scrollbarColor: '#F8AD18 #131111',
    '&::-webkit-scrollbar': {
      width: '12px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#131111',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#F8AD18',
      borderRadius: '24px',
    },
  },
};

const theme = extendTheme({ styles: {global: () => (colors)}});
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
