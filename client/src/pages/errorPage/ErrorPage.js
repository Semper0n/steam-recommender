import React from 'react';
import cl from "./ErrorPage.module.css"
import img from "../../images/favicon.png"

const ErrorPage = () => {
    return (
        <div className={cl.wrapper}>
            <p className={cl["error-404"]}>4<img className={cl.logo} src={img} alt/>4</p>
            <h1>Страница не найдена</h1>

        </div>
    );
};

export default ErrorPage;