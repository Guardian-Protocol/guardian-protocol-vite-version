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
    <Routes location={location} key={location.pathname}>
      {routes.map(({ path, Page }) => (
        <Route key={path} path={path} element={<Page setBalanceChanged={setBalanceChanged} balanceChanged={balanceChanged} />} />
      ))}
    </Routes>
  );
}

export { Routing };
