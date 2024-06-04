import React from 'react';
import ActivitiesGame from "../activitiesGame/ActivitiesGame";
import cl from "./UserActivitiesList.module.css"

const UserActivitiesList = ({gamesData}) => {
    gamesData.sort(function(a, b) {
        return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
    })

    return (
        <div className={cl.wrapper}>
            {gamesData.map((game) => {
                return <ActivitiesGame name={game.name} img={game.image} playtime={game.playtime_forever} key={game.appid} appid={game.appid}/>
            })}
        </div>
    );
};

export default UserActivitiesList;