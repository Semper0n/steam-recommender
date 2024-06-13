import React, {useState} from 'react';
import cl from "./Filters.module.css"
import InputRange from "../inputRange/InputRange";
import InputTag from "../inputTag/InputTag";
import DoubleInputRange from "../doubleInputRange/DoubleInputRange";

const Filters = ({onFilterChange}) => {
    const [rating, setRating] = useState(undefined);
    const [popularity, setPopularity] = useState(undefined);
    const [genresTagsWeight, setGenresTagsWeight] = useState(undefined);
    const [date, setDate] = useState(undefined);

    const handleRatingChange = (value) => {
        setRating(value);
        onFilterChange({rating: value, popularity, genresTagsWeight, date});
    };

    const handlePopularityChange = (value) => {
        setPopularity(value);
        onFilterChange({rating, popularity: value, genresTagsWeight, date});
    };

    const handleGenresTagsWeightChange = (value) => {
        setGenresTagsWeight(value);
        onFilterChange({rating, popularity, genresTagsWeight: value, date});
    };

    const handleDateChange = (value) => {
        setDate(value);
        onFilterChange({rating, popularity, genresTagsWeight, date: value});
    };

    return (
        <div className={cl.wrapper}>
            <InputRange title={"По рейтингу"} min="0" max="10" step="1" leftExtreme="С наименьшим рейтингом"
                        rightExtreme="С наивысшим рейтингом" initialValue="10" onChange={handleRatingChange}/>
            <InputRange title={"По популярности"} min="0" max="1" step="0.01" leftExtreme="Менее популярные"
                        rightExtreme="Более популярные" initialValue="1" onChange={handlePopularityChange}/>
            <DoubleInputRange title={"По дате"} min="1997" max="2024" step="1" leftExtreme="1997" rightExtreme="2024" initialValueLeft="1997"
                              initialValueRight="2024" onChange={handleDateChange}/>
            <InputRange title={"Веса по жанрам/меткам"} min="0" max="1" step="0.1" leftExtreme="Жанры"
                        rightExtreme="Метки" initialValue="0.3" onChange={handleGenresTagsWeightChange}/>
            <div className={cl["input-tag-wrapper"]}>
                <InputTag title={"Поиск по меткам"} placeholder={"Введите название метки"}/>
                <InputTag title={"Скрыть метки"} placeholder={"Введите название метки"}/>
            </div>
        </div>

    );
};

export default Filters;