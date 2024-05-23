import React from 'react';
import cl from "./AppItem.module.css"

const AppItem = ({name, date, tags, img}) => {
    return (
        <article className={cl.wrapper}>
            <div className={cl['picture-wrapper']}>
                <img src={img} alt={name} className={cl.picture}/>
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
    );
};

export default AppItem;