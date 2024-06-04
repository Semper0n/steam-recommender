import React, {useState} from 'react';
import cl from "./InputRange.module.css"

const InputRange = ({title, min, max, step, leftExtreme, rightExtreme}) => {
    const [value, setValue] = useState()
    return (
        <div className={cl.wrapper}>
            <p className={cl.title}>{title}</p>
            <div className={cl.extremes}>
                <p>{leftExtreme}</p>
                <p>{rightExtreme}</p>
            </div>
            <input className={cl.input} type="range" min={min} max={max} step={step} onChange={e => setValue(e.target.value)} value={value} />
        </div>
    );
};

export default InputRange;