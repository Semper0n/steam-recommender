import React, {useEffect, useState} from 'react';
import cl from "./RecommenderPage.module.css"
import AppsList from "../../components/appsList/AppsList";
import {useParams} from "react-router-dom";
import {getFilteredApps, getRecommendedAppsData, getUserInfo} from "../../http/userAPI";
import ErrorPage from "../errorPage/ErrorPage";
import UserInfo from "../../components/userInfo/UserInfo";
import Filters from "../../components/filters/Filters";
import Spinner from "../../components/spinner/Spinner";

const RecommenderPage = () => {
    const {id} = useParams()
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState(null)
    const [recommendedList, setRecommendedList] = useState(null)
    const [rawRecommendedList, setRawRecommendedList] = useState(null);
    const [visibleCount, setVisibleCount] = useState(20);

    const getURL = async () => {
        try {
            const response = await getUserInfo(id)
            return response
        } catch (e) {
            throw new Error(e.response.data.message);
        }
    }

    const getAppsData = async (list) => {
        try {
            const response = await getRecommendedAppsData(list.slice(0, visibleCount))
            console.log(response)
            return response
        } catch (e) {
            throw new Error(e.response.data.message);
        }
    }

    const getFilteredAppsData = async (filters) => {
        try {
            const response = await getFilteredApps(filters);
            if (response && response.data) {
                setRawRecommendedList(response.data)
                const appsData = await getAppsData(response.data);
                setRecommendedList(appsData);
                setVisibleCount(20);
            } else {
                console.error("Полученный ответ некорректен или пуст.");
            }

        } catch (e) {
            throw new Error(e.response.data.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getURL();
                setData(userData);
                setRawRecommendedList(userData.data.userRecommendations)
                const appsData = await getAppsData(userData.data.userRecommendations);
                setRecommendedList(appsData);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setHasError(true);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const pagination = async () => {
            if (rawRecommendedList){
                const appsData = await getAppsData(rawRecommendedList);
                setRecommendedList(appsData);
            }

        }

        pagination()
    }, [visibleCount])

    const handleLoadMore = () => {
        setVisibleCount(visibleCount + 20);
    };

    //console.log(data)
    if (isLoading) {
        return <Spinner />
    }

    if (hasError) {
        return <ErrorPage />;
    }

    return (
        <section className={cl.wrapper}>
            <div className={cl['user-info-wrapper']}>
                <UserInfo data={data.data}/>
            </div>
            <div className={cl['apps-list-wrapper']}>
                <h1>РЕКОМЕНДАЦИИ</h1>
                <Filters onFilterChange={getFilteredAppsData}/>
                <AppsList userRecomendations={recommendedList.data}/>
                <button className={cl['load-more']} onClick={handleLoadMore}>Загрузить ещё</button>
            </div>
        </section>
    );


};

export default RecommenderPage;