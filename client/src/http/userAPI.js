import {$host} from "./index";

export const getUserInfo = async (URL) => {
    return await $host.get(`api/user/getinfo/${URL}`)
}

export const checkUser = async (URL) => {
    return await $host.get(`api/user/check/${URL}`)
}

export const getRecommendedAppsData = async (recommendationsIDs) => {
    return await $host.post(`api/user/getRecommendedAppsData`, {recommendationsIDs})
}