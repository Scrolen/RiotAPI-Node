const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const ejsmate = require('ejs-mate');

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'assets')));
app.set('views', path.join(__dirname, 'views'));

const apikey = '' // PLACE YOUR API KEY IN HERE
const headers = {
    "X-Riot-Token": apikey
}

// Home Route
app.get('/', async(req, res) => {
   res.render('home')
})
// Route Used to send search data to API
app.post('/', async(req, res) => {
    console.log(req.body.summoner)
     var {name} = req.body.summoner
     var {region} = req.body.summoner
    res.redirect(`${region}/${name}`)
 })


// Route for summoner based on region
app.get('/:region/:summonerName', async(req, res) => {
    var {region} = req.params;
    var {summonerName} = req.params; // Name of Summoner We Are Searching For
    var playerurl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`

    const player = await fetch(playerurl, {method: 'GET', headers: headers}) // Fetching Data From Riot Api
    .then(response => response.json())
    .then(data => {
      return data
    })
    var accountId = player.accountId
    matchsurl = `https://${region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${accountId}?endIndex=3&beginIndex=0`

    const matches = await fetch(matchsurl, {method: 'GET', headers: headers}) // Fetching Data From Riot Api
    .then(response => response.json())
    .then(data => {
      return data
    })

    games = []

    for(var i =0; i< matches.matches.length; i++){
        matchID = matches.matches[i].gameId
        matchurl = `https://${region}.api.riotgames.com/lol/match/v4/matches/${matchID}`
        game = await fetch(matchurl, {method: 'GET', headers: headers}) // Fetching Data From Riot Api
        .then(response => response.json())
        .then(data => {
            return data
        })
        games[i] = game
    }

    finalGames = []
    for(var j =0; j<games.length; j++){
        partID = 0
        for(var k = 0; k < 10; k++)
            if(games[j].participantIdentities[k].player.summonerName.toLowerCase() === summonerName.toLowerCase()){
                partID = games[j].participantIdentities[1].participantId;
                break;
            }
        playerData = await games[j].participants.filter(obj => {
            return obj.participantId === partID
        })

        finalGames[j] = playerData

    }

    // console.log(finalGames)

    
    res.render('summoner',{player, region, finalGames})
})



app.listen(3000, () => {
})
