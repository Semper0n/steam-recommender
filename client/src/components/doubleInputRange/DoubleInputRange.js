import React, {useEffect, useState} from 'react';
import cl from "./DoubleInputRange.module.css"

const DoubleInputRange = ({title, min, max, step, leftExtreme,
                              rightExtreme, initialValueLeft, initialValueRight, onChange}) => {
    const [valueLeft, setValueLeft] = useState(Number(initialValueLeft));
    const [valueRight, setValueRight] = useState(Number(initialValueRight));


    const handleLeftChange = (e) => {
        const newValue = Math.min(Number(e.target.value), valueRight);
        setValueLeft(newValue);
    };

    const handleRightChange = (e) => {
        const newValue = Math.max(Number(e.target.value), valueLeft);
        setValueRight(newValue);
    };

    const handleMouseUp = () => {
        onChange([valueLeft, valueRight]);
    };

    const leftPercentage = ((valueLeft - min) / (max - min)) * 100;
    const rightPercentage = ((valueRight - min) / (max - min)) * 100;

    return (
        <div className={cl.wrapper}>
            <p className={cl.title}>{title}</p>
            <div className={cl.extremes}>
                <p style={{ left: `${leftPercentage}%`, right: `${100 - rightPercentage}%` }}>{valueLeft}</p>
                <p>{valueRight}</p>
            </div>
            <div className={cl["range-slider"]}>
                <span className={cl["range-selected"]} style={{ left: `${leftPercentage}%`, right: `${100 - rightPercentage}%` }}></span>
            </div>
            <div className={cl.slider}>
                <input
                    type="range" min={min} max={max} step={step} onChange={handleLeftChange}
                    defaultValue={initialValueLeft} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}
                />
                <input
                    type="range" min={min} max={max} step={step} onChange={handleRightChange}
                    defaultValue={initialValueRight} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}
                />
            </div>
        </div>
    );
};

export default DoubleInputRange;