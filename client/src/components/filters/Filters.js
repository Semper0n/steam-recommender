import React from 'react';
import cl from "./Filters.module.css"
import InputRange from "../inputRange/InputRange";
import InputTag from "../inputTag/InputTag";

const Filters = () => {
    return (
        <div className={cl.wrapper}>
            <InputRange title={"По рейтингу"} min="0" max="10" step="1" leftExtreme="С наименьшим рейтингом" rightExtreme="С наивысшим рейтингом"/>
            <InputRange title={"По популярности"} min="0" max="1" step="0.01" leftExtreme="Менее популярные" rightExtreme="Более популярные"/>
            <InputRange title={"По дате"}/>
            <InputRange title={"Веса по жанрам/меткам"} min="0" max="1" step="0.1" leftExtreme="Жанры" rightExtreme="Метки"/>
            <div className={cl["input-tag-wrapper"]}>
                <InputTag title={"Поиск по меткам"} placeholder={"Введите название метки"}/>
                <InputTag title={"Скрыть метки"} placeholder={"Введите название метки"}/>
            </div>
        </div>

    );
};

export default Filters;