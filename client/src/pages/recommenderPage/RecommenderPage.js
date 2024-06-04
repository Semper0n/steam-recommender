import React, {useEffect, useState} from 'react';
import cl from "./RecommenderPage.module.css"
import AppsList from "../../components/appsList/AppsList";
import {useParams} from "react-router-dom";
import {getRecommendedAppsData, getUserInfo} from "../../http/userAPI";
import ErrorPage from "../ErrorPage";
import UserInfo from "../../components/userInfo/UserInfo";
import Filters from "../../components/filters/Filters";

const RecommenderPage = () => {
    const {id} = useParams()
    const [isExists, setIsExists] = useState(false)
    const [data, setData] = useState(null)
    const [recommendedList, setRecommendedList] = useState(null)

    const getURL = async () => {
        try {
            const response = await getUserInfo(id)
            return response
        } catch (e) {
            console.log(e.response.data.message)
        }
    }

    const getAppsData = async () => {
        try {
            const response = await getRecommendedAppsData(data.data.userRecommendations.slice(0, 20))
            setIsExists(true)
            return response
        } catch (e) {
            console.log(e.response.data.message)
        }
    }

    useEffect(() => {
        getURL().then(r => setData(r))
    }, [])

    useEffect(() => {
        if (data) {
            getAppsData().then(r => setRecommendedList(r))
            //console.log(recommendedList)
        }
    }, [data]);

    console.log(data)

    if (isExists) {
        return (
            <section className={cl.wrapper}>
                <div className={cl['user-info-wrapper']}>
                    <UserInfo data={data.data} />
                </div>
                <div className={cl['apps-list-wrapper']}>
                    <h1>РЕКОМЕНДАЦИИ</h1>
                    <Filters />
                    <AppsList userRecomendations={recommendedList.data} />
                </div>
            </section>
        );
    } else {
        return (
            <ErrorPage />
        )
    }


};

export default RecommenderPage;