const App = require("../models/app");

const APIKEY = process.env.APIKEY


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

            let [userData, gamesData] = responses;

            if (!userData.response.players[0]) {
                return res.status(404).json({message: "Введён неверный SteamID."});
            }

            const appsList = []
            const appsIds = []
            const indicesToRemove = []

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
        let userData = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${APIKEY}&steamids=${req.params.steamid}`)
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

    async getFilteredData(req, res) {
        const data = req.body
        console.log(req.query)
        const response = data
        // Код.......
        return res.json(response)
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

async function getRecommendations(preferences, IDs) {
    const {genreCounts, tagCounts} = preferences;
    let recommendations = [];

    const allGames = await App.find({is_free: {$ne: null}, tags: {$exists: true, $not: {$size: 0}}, appid: {$nin: IDs}}, {appid: 1, genres: 1, tags: 1}).lean() // {is_free: {$ne: null},tags: {$exists: true, $not: {$size: 0}}}, {appid: 1, name: 1, genres: 1, tags: 1}
    allGames.forEach(game => {
        let genreScore = game.genres.reduce((acc, genre) => acc + (genreCounts[genre.description] || 0), 0);
        let tagScore = game.tags.reduce((acc, tag) => acc + (tagCounts[tag.description] || 0), 0);

        let totalScore = genreScore * 0.7 + tagScore * 0.3;

        if (totalScore > 0) {
            recommendations.push({appid: game.appid, score: totalScore});
        }
    });

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
}

module.exports = new UserController()