import React, {useState} from 'react';
import cl from "./InputRange.module.css"

const InputRange = ({title, min, max, step, leftExtreme, rightExtreme, initialValue, onChange}) => {
    const [value, setValue] = useState(initialValue)

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
    };

    const handleMouseUp = () => {
        onChange(value);
    };

    return (
        <div className={cl.wrapper}>
            <p className={cl.title}>{title}</p>
            <div className={cl.extremes}>
                <p>{leftExtreme}</p>
                <p>{rightExtreme}</p>
            </div>
            <input className={cl.input} type="range" min={min} max={max} step={step} onChange={handleChange}
                   onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} value={value}/>
        </div>
    );
};

export default InputRange;