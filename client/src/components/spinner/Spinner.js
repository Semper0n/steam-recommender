import React from 'react';
import cl from "./Spinner.module.css"
import upper from "../../images/upper.png"
import lower from "../../images/lower.png"
import center from "../../images/center.png"

const Spinner = () => {
    return (
        <div className={cl.wrapper}>
            <div className={cl.loader}>
                <div className={cl["images-wrapper"]}>
                    <img className={cl.upper} src={upper} alt=''/>
                    <img className={cl.lower} src={lower} alt=''/>
                    <img className={cl.center} src={center} alt=''/>
                </div>
                <div className={cl.text}>Идёт загрузка...</div>
            </div>
        </div>
    );
};

export default Spinner;