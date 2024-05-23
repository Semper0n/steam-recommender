import {$host} from "./index";

export const getUserInfo = async (URL) => {
    return await $host.get(`api/getuserinfo/${URL}`)
}

export const checkUser = async (URL) => {
    return await $host.get(`api/checkUser/${URL}`)
}