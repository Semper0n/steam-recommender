const App = require("../models/app");

const APIKEY = process.env.APIKEY


let appsListForFilters = []
let appsIdsForFilters = []

class UserController {


    async getUserInfo(req, res) {
        try {
            let apiUrl = `https://api.steampowered.com`;

            let urls = [
                `${apiUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${APIKEY}&steamids=${req.params.steamid}`,
                `${apiUrl}/IPlayerService/GetOwnedGames/v0001/?key=${APIKEY}&steamid=${req.params.steamid}&format=json`
            ];

            let responses = await Promise.all(urls.map(url => fetch(url).then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP status ${res.status}`);
                }
                return res.json();
            })));

            allGames = undefined

            let [userData, gamesData] = responses;

            if (!userData.response.players[0]) {
                return res.status(404).json({message: "Введён неверный SteamID."});
            }

            const appsList = []
            const appsIds = []
            const indicesToRemove = []

            let distinct = await App.distinct('tags.description') ///////////////////////////////////////////////////////////////
            //console.log(distinct)

            await Promise.all(gamesData.response.games.map(async (app, index) => {
                const data = await App.findOne({appid: app.appid})
                if (data && data.is_free !== null && data.tags.length !== 0 && data.is_free !== undefined) {
                    appsList.push(data)
                    appsIds.push(data.appid)
                }
                if (data && data.is_free !== null && data.is_free !== undefined) {
                    app.name = data.name
                    app.image = data.header_image
                } else {
                    indicesToRemove.push(index)
                    //console.log('=====ERROR=====');
                }
            }));
            indicesToRemove.sort((a, b) => b - a); // Сортировка индексов в порядке убывания
            indicesToRemove.forEach(index => {
                gamesData.response.games.splice(index, 1);
            });
            gamesData.response.game_count -= indicesToRemove.length;

            appsListForFilters = appsList
            appsIdsForFilters = appsIds
            const result = await getRecommendations(analyzePreferences(appsList), appsIds)

            return res.json({
                userInfo: userData.response.players[0],
                gamesData: gamesData.response,
                userRecommendations: result
            });


        } catch (error) {
            console.error(error);
            return res.status(400).json({message: "Provided SteamID is invalid."});
        }
    }

    async checkUser(req, res) {
        let IDRegex = new RegExp('^\\d{17}$')
        let steamID
        if (!IDRegex.exec(req.params.steamid)) {
            steamID = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${APIKEY}&vanityurl=${req.params.steamid}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP status ${res.status}`);
                    }
                    return res.json();
                })
            steamID = steamID.response.steamid
        } else
            steamID = req.params.steamid
        let userData = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${APIKEY}&steamids=${steamID}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP status ${res.status}`);
                }
                return res.json();
            })
        if (!userData.response.players[0]) {
            return res.status(404).json({message: "Provided SteamID is invalid."});
        }
        return res.json(userData.response.players[0]);
    }

    async getRecommendedAppsData(req, res) {
        const data = req.body
        const response = []
        for await (const key of data.recommendationsIDs) {
            const game = await App.findOne({appid: key.appid})
            response.push(game)
        }
        return res.json(response)
    }

    async getFilteredApps(req, res) {
        const data = req.body.filters
        const result = await getRecommendations(analyzePreferences(appsListForFilters), appsIdsForFilters, data.rating, data.popularity, data.genresTagsWeight, data.date)
        return res.json(result)
    }

}

function analyzePreferences(games) {
    const genreCounts = {};
    const tagCounts = {};
    games.forEach(game => {
        game.genres.forEach(genre => {
            genre = genre.description
            if (genreCounts[genre]) {
                genreCounts[genre]++;
            } else {
                genreCounts[genre] = 1;
            }
        });

        game.tags.forEach(tag => {
            tag = tag.description
            if (tagCounts[tag]) {
                tagCounts[tag]++;
            } else {
                tagCounts[tag] = 1;
            }
        });
    });
    return {genreCounts, tagCounts};
}

let allGames
let filteredGamesByDate

async function getRecommendations(preferences, IDs, rating, popularity, genresTagsWeight, date) {
    const {genreCounts, tagCounts} = preferences;
    let recommendations = [];
    if (allGames === undefined)
        allGames = await App.find({
            is_free: {$ne: null},
            tags: {$exists: true, $not: {$size: 0}},
            appid: {$nin: IDs}, "release_date.date": {$ne: ''},
            rating: {$exists: true, $not: {$size: 0}}
        },
        {appid: 1, _id: 0, "genres.description": 1, "tags.description": 1, "rating.review_score": 1, "rating.total_reviews": 1, "release_date.year": 1}).lean() // {is_free: {$ne: null},tags: {$exists: true, $not: {$size: 0}}}, {appid: 1, name: 1, genres: 1, tags: 1}
    allGames.forEach(game => {
        game.normalizedPopularity = Math.log(game.rating.total_reviews + 1)
    });
    const maxLogPopularity = Math.max(...allGames.map(game => game.normalizedPopularity))
    allGames.forEach(game => {
        game.normalizedPopularity = game.normalizedPopularity / maxLogPopularity;
    });

    if (genresTagsWeight === undefined) {
        genresTagsWeight = 0.3
    }

    if (rating === undefined) {
        rating = 10
    }

    if (popularity === undefined) {
        popularity = 1
    }

    if (date !== undefined) {
        const [startYear, endYear] = date;
        filteredGamesByDate = allGames.filter(game => game.release_date.year >= startYear && game.release_date.year <= endYear);
    } else filteredGamesByDate = allGames

    filteredGamesByDate.forEach(game => {
        let genreScore = game.genres.reduce((acc, genre) => acc + (genreCounts[genre.description] || 0), 0);
        let tagScore = game.tags.reduce((acc, tag) => acc + (tagCounts[tag.description] || 0), 0);

        let baseScore = genreScore * Number(genresTagsWeight) + tagScore * (1 - Number(genresTagsWeight));

        if (rating === undefined && popularity === undefined) {
            if (baseScore > 0) {
                recommendations.push({appid: game.appid, score: baseScore, rating: game.rating.review_score});
            }
        } else if (rating !== undefined && popularity === undefined) {
            let deviation = Math.abs(game.rating.review_score - rating);
            let weight = Math.max(0, 1 - 0.1 * deviation);
            let totalScore = baseScore * weight;
            if (totalScore > 0) {
                recommendations.push({appid: game.appid, score: totalScore, rating: game.rating.review_score});
            }
        } else if (rating === undefined && popularity !== undefined) {
            let popularityWeight = 1 - Math.abs(popularity - game.normalizedPopularity);
            let totalScore = baseScore * popularityWeight;
            if (totalScore > 0) {
                recommendations.push({appid: game.appid, score: totalScore, rating: game.rating.review_score, popularityWeight: popularityWeight, popularity: game.normalizedPopularity});
            }
        } else {
            let deviation = Math.abs(game.rating.review_score - rating);
            let ratingWeight = Math.max(0, 1 - 0.1 * deviation);
            let popularityWeight = 1 - Math.abs(popularity - game.normalizedPopularity);
            let totalScore = baseScore * ratingWeight * popularityWeight;
            if (totalScore > 0) {
                recommendations.push({appid: game.appid, score: totalScore, rating: game.rating.review_score, popularityWeight: popularityWeight, popularity: game.normalizedPopularity});
            }

    }});
    recommendations.sort((a, b) => b.score - a.score);
    //console.log(recommendations)
    return recommendations;
}

module.exports = new UserController()