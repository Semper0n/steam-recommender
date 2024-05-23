import React from 'react';
import cl from "./ActivitiesGame.module.css";

const ActivitiesGame = ({name, img, playtime}) => {
    return (
        <div className={cl.wrapper}>
            <div className={cl['image-wrapper']}>
                <img src={img} alt="avatar" className={cl.image}/>
            </div>
            <div className={cl['info-wrapper']}>
                <p>{name}</p>
                <p>{(playtime > 60) ? Math.round(playtime/60) + " ч." : playtime + " мин."}</p>
            </div>

        </div>
    );
};

export default ActivitiesGame;