import React from 'react';
import cl from "./Header.module.css"
import logo from "../../images/Logo.png"
import {Link} from "react-router-dom";

const Header = () => {
    return (
        <header className={cl.header}>
            <div className={cl.content}>
                <Link to={"/"}>
                    <img className={cl.logo} src={logo} alt={'logo'}/>
                </Link>
            </div>
        </header>
    );
};

export default Header;