import React from 'react';
import "./Header.scss";
import {MdMenu} from "react-icons/md";

const Header = ({
    drawerIsOpen,
    setDrawerIsOpen
}: {
    drawerIsOpen: boolean,
    setDrawerIsOpen: (isOpen: boolean) => void
}) => {
    return (
        <div className="Header">
            <MdMenu onClick={() => {
                setDrawerIsOpen(!drawerIsOpen);
            }} />
        </div>
    );
};

export default Header;