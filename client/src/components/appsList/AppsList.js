import React from 'react';
import AppItem from "../appItem/AppItem";

const AppsList = ({userRecomendations}) => {

    return (
        <div>
            {userRecomendations.map(app => {
                return <AppItem name={app.game.name}
                                date={app.game.release_date.date}
                                img={app.game.header_image}
                                key={app.game.appid}
                                tags={app.game.tags}/>
            })}
        </div>
    );
};

export default AppsList;