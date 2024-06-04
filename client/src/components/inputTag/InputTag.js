import React from 'react';
import cl from "./InputTag.module.css"

const InputTag = ({title, placeholder}) => {
    return (
        <div className={cl.wrapper}>
            <p className={cl.title}>{title}</p>
            <input type="text" placeholder={placeholder}/>
        </div>
    );
};

export default InputTag;