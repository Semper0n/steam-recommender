import React from 'react';
import AppItem from "../appItem/AppItem";

const AppsList = ({userRecomendations}) => {
    return (
        <div>
            {userRecomendations.map(app => {
                //return <p key={app.appid}>{app.appid}</p>
                return <AppItem name={app.name}
                                date={app.release_date.date}
                                img={app.header_image}
                                tags={app.tags}
                                key={app.appid}
                                appid={app.appid}
                />
            })}
        </div>
    );
};

export default AppsList;