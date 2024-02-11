import React from 'react';
import "./Drawer.scss";
import Divider from "../components/divider/Divider";
import {MdClose} from "react-icons/md";
import { motion } from "framer-motion"
import {useNavigate} from "react-router-dom";
import {useGlobalVariables} from "../../provider/GlobalVariablesProvider";
import {signOut} from "firebase/auth"
import {auth} from "../../firebase/Firebase";

const Drawer = ({
    drawerIsOpen,
    setDrawerIsOpen
}: {
    drawerIsOpen: boolean,
    setDrawerIsOpen: (isOpen: boolean) => void
}) => {
    const navigate = useNavigate()
    const globalVariables = useGlobalVariables()

    const onNavigationButtonClick = (path: string) => {
        navigate(path);
        setDrawerIsOpen(false);
    }

    const logout = () => {
        signOut(auth).then(() => {
            globalVariables.setLSVar("server", null);
            setDrawerIsOpen(false);
            navigate("/login");
        })
    }

    return (
        <motion.div
            className="Drawer"
            initial={{ x: "-100%" }}
            animate={{ x: drawerIsOpen ? 0 : "-100%" }}
            transition={{ duration: 0.2 }}
        >
            <div className="DrawerHeader">
                <h1>Menü</h1>
                <MdClose className="closeIcon" onClick={() => {
                    setDrawerIsOpen(false);
                }} />
            </div>
            <Divider />
            <h2 onClick={() => onNavigationButtonClick("games")}>Spiele</h2>
            <h2 onClick={() => onNavigationButtonClick("game")}>Aktuelles Spiel</h2>
            <h2 onClick={() => onNavigationButtonClick("create-game")}>Spiel erstellen</h2>
            <h2 onClick={() => onNavigationButtonClick("players")}>Spieler</h2>
            <h2 onClick={() => onNavigationButtonClick("admin")}>Admin</h2>
            <h2 onClick={logout}>Abmelden</h2>
        </motion.div>
    );
};

export default Drawer;