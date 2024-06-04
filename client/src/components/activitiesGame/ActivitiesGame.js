import React from 'react';
import cl from "./ActivitiesGame.module.css";
import {Link} from "react-router-dom";

const ActivitiesGame = ({name, img, playtime, appid}) => {
    return (
        <Link to={`https://store.steampowered.com/app/${appid}`}>
            <div className={cl.wrapper}>
                <div className={cl['image-wrapper']}>
                    <img src={img} alt={''} className={cl.image}/>
                </div>
                <div className={cl['info-wrapper']}>
                    <p className={cl.name}>{name}</p>
                    <p className={cl.time}>{(playtime > 60) ? Math.round(playtime/60) + " ч." : playtime + " мин."}</p>
                </div>
            </div>
        </Link>
    );
};

export default ActivitiesGame;