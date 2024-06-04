import cl from "./UserInfo.module.css"
import UserActivitiesList from "../userActivitiesList/UserActivitiesList";
import React from "react";
import {Link} from "react-router-dom";

const UserInfo = ({data}) => {
    const userInfo = data.userInfo
    const gamesData = data.gamesData

    return (
        <div className={cl.wrapper}>
            <div className={cl['user-info']}>
                <Link to={userInfo.profileurl}>
                    <div className={cl['image-wrapper']}>
                        <img src={userInfo.avatarfull} alt="avatar" className={cl.image}/>
                    </div>
                </Link>
                <div className={cl['info-wrapper']}>
                    <Link to={userInfo.profileurl}>
                        <p className={cl.nickname}>{userInfo.personaname}</p>
                    </Link>
                    <p className={cl['game-count']}>Количество игр: {gamesData.game_count}</p>
                </div>

            </div>
            <UserActivitiesList gamesData={gamesData.games}/>
        </div>
    );
};

export default UserInfo;