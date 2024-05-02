const express = require('express');
const mongoose = require('mongoose')
const App = require('./models/app')


const PORT = 3000;
const URL = 'mongodb://0.0.0.0:27017/steam_recommender'


const app = express();

// Подключение к БД
mongoose
    .connect(URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(`DB connection error: ${err}`))
app.listen(PORT, (err) => {
    err ? console.log(err) : console.log(`Listening port ${PORT}`)
})

// Обработчик ошибок
const handleError = (res, error) => {
    res.status(500).json({error})
}

// Вывод списка приложений в БД
app.get('/apps', (req, res) => {
    App
        .find() // cursor - hasNext, next, forEach
        .sort({title: 1})
        .then((apps) => {
            res
                .status(200)
                .json(apps)
        })
        .catch(() => handleError(res, "Something goes wrong...")
        )
})

// Вывод определённого приложения в БД
app.get('/apps/:id', (req, res) => {
    App
        .find({appid: Number(req.params.id)})
        .then((doc) => {
            if (doc) {
                res
                    .status(200)
                    .json(doc)
            } else {
                handleError(res, "Wrong id")
            }

        })
        .catch(() => handleError(res, "Something goes wrong...")
        )
})

async function insertAppToDB(list) {
    for (let key of list) {
        const app = new App(key)
        let isTrue = await App.exists({appid: app.appid})
        if (isTrue) {
            console.log(`Приложение с appid ${app.appid} уже существует`)
        } else {
            app.save()
        }
    }
}

// Парсинг списка приложений Steam
app.get('/getappslist', (req, res) => {
    fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/")
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('HTTP status ' + response.status);
            }
        })
        .then(data => {
            let parsedAppsList = JSON.parse(data.toString())
            parsedAppsList = parsedAppsList.applist.apps
            let parsedAppsList10 = parsedAppsList.slice(0, 100) // временная фигня
            console.log('Done writing')
            res.json(parsedAppsList10)
            insertAppToDB(parsedAppsList10)
        })
        // .then(() => {
        //     App
        //         .find()
        //         .then(apps => {
        //             if (apps) {
        //
        //             } else {
        //                 handleError(res, "No apps")
        //             }
        //
        //
        //         })
        //         .catch(error => {
        //             console.error(error);
        //         })
        // })
})


// .then(data => {
//     let appsList = JSON.parse(data.toString())
//     fs.writeFileSync('appsList.json', JSON.stringify(appsList.applist.apps))
//     console.log('Done writing')
// })


// fetch("https://store.steampowered.com/api/appdetails?appids=976010")
//     .then(response => {
//         if (response.ok) {
//             return response.text();
//         } else {
//             throw new Error('HTTP status ' + response.status);
//         }
//     })
//     .then(data => {
//         let appInfo = JSON.parse(data.toString())
//         console.log(appInfo['976010'].success)
//     })
//     .catch(error => {
//         console.error(error);
//     });


// fetch("https://store.steampowered.com/tag/browse/#global_492")
//     .then(response => {
//         if (response.ok) {
//             return response.text();
//         } else {
//             throw new Error('HTTP status ' + response.status);
//         }
//     })
//     .then(data => {
//         let htmlContent = data
//         let tagRegex = new RegExp("tagid=\"\\d+\">([a-zA-Z0-9\\s'\\./_&amp;-]+)</div>", "g");
//         let matches;
//         while((matches = tagRegex.exec(htmlContent)) !== null)
//         {
//             console.log(matches[1]);
//         }
//         // console.log(data);
//     })
//     .catch(error => {
//         console.error(error);
//     });