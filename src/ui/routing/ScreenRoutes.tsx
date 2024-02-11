import React, {useEffect} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useNavigate} from "react-router-dom";
import ScrollToTop from "../../hooks/ScrollToTop";
import Games from "../screens/games/Games";
import GameDetail from "../screens/gamedetail/GameDetail";
import CreateGame from "../screens/creategame/CreateGame";
import Game from "../screens/game/Game";
import Header from "../header/Header";
import Drawer from "../drawer/Drawer";
import Players from "../screens/players/Players";
import useLocalStorage from "../../hooks/useLocalStorage";
import ConditionReRoute from "./ConditionReRoute";
import Login from "../screens/login/Login";
import {ServerModel} from "../../data/game/ServerModel";
import {onValue, ref} from "firebase/database";
import {db} from "../../firebase/Firebase";
import {useGlobalVariables} from "../../provider/GlobalVariablesProvider";
import Footer from "../footer/Footer";
import "./ScreenRoutes.scss";
import Admin from "../screens/admin/Admin";

const ScreenRoutes = () => {
    const navigate = useNavigate();

    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [drawerIsOpen, setDrawerIsOpen] = React.useState<boolean>(false);

    useEffect(() => {
        if (!server) {
            navigate("/login");
        }
    }, [server]);

    return (
        <>
            {server && <>
                <Drawer drawerIsOpen={drawerIsOpen} setDrawerIsOpen={setDrawerIsOpen} />
                <Header drawerIsOpen={drawerIsOpen} setDrawerIsOpen={setDrawerIsOpen} /></>}
                <Footer />
                <ScrollToTop />
                <div className="ScreenRoutesScreens">
                    <Routes>
                        <Route path="/games" element={
                            <Games />
                        } />
                        <Route path="/games/:uid" element={
                            <GameDetail />
                        }/>
                        <Route path="/game" element={
                            <Game />
                        } />
                        <Route path="/create-game" element={
                            <CreateGame />
                        } />
                        <Route path="/players" element={
                            <Players />
                        } />
                        <Route path="/admin" element={
                            <Admin />
                        } />
                        <Route path="/login" element={
                            <Login />
                        } />
                        <Route path="*" element={
                            <Navigate to="/games" />
                        } />
                    </Routes>
                </div>
            </>
    );
};

export default ScreenRoutes;