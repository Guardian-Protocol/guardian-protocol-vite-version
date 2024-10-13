import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./home";
import {Landing} from "@/pages/Landing";

const routes = [
  { path: "/", Page: Landing },
  { path: "/home", Page: Home },
];

function Routing({setBalanceChanged, balanceChanged}: any) {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/guardian-protocol-vite-version/" element={<Landing setBalanceChanged={setBalanceChanged} balanceChanged={balanceChanged} />}/>
      <Route path="/guardian-protocol-vite-version/home" element={<Home setBalanceChanged={setBalanceChanged} balanceChanged={balanceChanged} />} />
    </Routes>
  );
}

export { Routing };
