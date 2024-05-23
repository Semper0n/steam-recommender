import React from 'react';
import cl from "./Footer.module.css"
import {Link} from "react-router-dom";
import vk from "../../images/vk.png"
import inst from "../../images/instagram.png"

const Footer = () => {
    return (
        <div className={cl.footer}>
            <div className={cl.wrapper}>
                    <div className={cl["copyright-info"]}>
                        GameCompass is a hobby project and is not affiliated with Valve or Steam.
                    </div>
                    <div className={cl.social}>
                        <Link className={cl.link} to={""}>
                            <img className={cl.icon} src={vk} alt="VK"/>
                        </Link>
                        <Link className={cl.link} to={""}>
                            <img className={cl.icon} src={inst} alt="VK"/>
                        </Link>
                    </div>
                </div>
        </div>
    );
};

export default Footer;