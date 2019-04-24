var admin = require('firebase-admin');
var db = admin.firestore();

newRankings = (player, opponent, won) => {
    const k = 30;
    const playerRating = Math.pow(10, player/400);
    const opponentRating = Math.pow(10, opponent/400);
    const playerExpected = playerRating/(playerRating+opponentRating);
    if (Number.isNaN(k)) {
        console.log('k');
    }
    if (Number.isNaN(playerRating)) {
        console.log('playerRating');
    }
    if (Number.isNaN(opponentRating)) {
        console.log('opponentRatingk');
    }
    if (Number.isNaN(playerExpected)) {
        console.log('playerExpected');
    }
    
    return player + k * (Number(won) - playerExpected);
}

module.exports = newRankings;
