import {$host} from "./index";
const axios = require('axios')

export const getUserInfo = async (URL) => {
    return await $host.get(`api/user/getinfo/${URL}`)
}

export const checkUser = async (URL) => {
    const vanityURL = URL.replace('https://steamcommunity.com/id/', '')
        .replace('https://steamcommunity.com/profiles/', '')
        .replace('/', '')
        .replace(' ', '')
    return await $host.get(`api/user/check/${vanityURL}`)
}

export const getRecommendedAppsData = async (recommendationsIDs) => {
    return await $host.post(`api/user/getRecommendedAppsData`, {recommendationsIDs})
}

export const getFilteredApps = async (filters) => {
    return await $host.post(`api/user/getFilteredApps`, {filters})
}