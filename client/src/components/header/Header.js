import React from 'react';
import cl from "./Header.module.css"
import logo from "../../images/Logo.png"
import {Link} from "react-router-dom";

const Header = () => {
    return (
        <header className={cl.header}>
            <Link to={"/"}>
            <div className={cl['logo-wrapper']}>
                <img className={cl.logo} src={logo} alt={'logo'}/>
            </div>
        </Link>
        </header>
    );
};

export default Header;