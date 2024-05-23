import cl from "./UserActivities.module.css"
import UserActivitiesList from "../userActivitiesList/UserActivitiesList";
import React from "react";

const UserActivities = ({data}) => {
    const userInfo = data.userInfo
    const gamesData = data.gamesData

    return (
        <div className={cl.wrapper}>
            <div className={cl['user-info']}>
                <div className={cl['image-wrapper']}>
                    <img src={userInfo.avatarfull} alt="avatar" className={cl.image}/>
                </div>
                <div className={cl['info-wrapper']}>
                    <p className={cl.nickname}>{userInfo.personaname}</p>
                    <p className={cl['game-count']}>Количество игр: {gamesData.game_count}</p>
                </div>

            </div>
            <UserActivitiesList gamesData={gamesData.games}/>
        </div>
    );
};

export default UserActivities;