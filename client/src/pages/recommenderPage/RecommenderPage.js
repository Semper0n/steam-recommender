import React, {useEffect, useState} from 'react';
import cl from "./RecommenderPage.module.css"
import AppsList from "../../components/appsList/AppsList";
import {useParams} from "react-router-dom";
import {getUserInfo} from "../../http/userAPI";
import ErrorPage from "../ErrorPage";
import UserActivities from "../../components/userInfo/UserActivities";

const RecommenderPage = () => {
    const {id} = useParams()
    const [isExists, setIsExists] = useState(false)
    const [data, setData] = useState({})

    const getURL = async () => {
        try {
            const response = await getUserInfo(id)
            setIsExists(true)
            return response
        } catch (e) {
            console.log(e.response.data.message)
        }
    }

    useEffect(() => {
        getURL().then(r => setData(r))
    }, [])

    console.log(data)
    if (isExists) {
        return (
            <section className={cl.wrapper}>
                <div className={cl['user-info-wrapper']}>
                    <UserActivities data={data.data} />
                </div>
                <div className={cl['apps-list-wrapper']}>
                    <AppsList userRecomendations={data.data.userRecommendations} />
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