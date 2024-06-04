import React from 'react';
import cl from "./AppItem.module.css"
import {Link} from "react-router-dom";

const AppItem = ({name, date, tags, img, appid}) => {
    return (
        <Link to={`https://store.steampowered.com/app/${appid}`} >
        <article className={cl.wrapper}>
            <div className={cl['picture-wrapper']}>
                <img src={img} alt='' className={cl.picture}/>
            </div>
            <div className={cl.content}>
                <div className={cl.text}>
                    <p className={cl.title}>{name}</p>
                    <p className={cl.date}>{date}</p>
                </div>
                <div className={cl.tags}>
                    {tags.slice(0,4).map((tag, index) => {
                        return <p key={index} className={cl.tag}>{tag.description}</p>
                    })}
                </div>
            </div>
        </article>
        </Link>
    );
};

export default AppItem;