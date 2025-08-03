
const  blue_board = document.getElementById('blue-Board');
const  red_board = document.getElementById('red-Board');
const  green_board = document.getElementById('green-Board');
const  yellow_board = document.getElementById('yellow-Board');


const rollBtn = document.querySelector('.roll');
const dice = document.querySelector('.dice');


const diceRollSound = new Audio ( 'asset/sound/roll-dice.mp3');
const killSound = new Audio ( 'asset/sound/kill-dice.mp3');
const moveSound = new Audio ( 'asset/sound/movePieceR.wav');


let playerTurn = [];
let currentPlayerTurnIndex = 0;
let prevPlayerTurnIndex;
let currentPlayerTurnStatus = true;
let teamHasBouns = false;

let diceResult;


let pathArray = [ 
    'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12','r13',
    'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12','g13',
    'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12','y13',
    'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12','b13',
];


let homePathEntries = {
    blue:  ['bh1', 'bh2','bh3', 'bh4','bh5','home'],
    yellow: ['yh1','yh2','yh3','yh4','yh5', 'home'],
    red:   ['rh1','rh2','rh3','rh4','rh5', 'home'],
    green: ['gh1','gh2','gh3','gh4','gh5', 'home']
};


let safePaths = [
    'r1','r9','b1','b9','y1','y9','g1','g9',
    ...homePathEntries.blue,
    ...homePathEntries.red,
    ...homePathEntries.yellow,
    ...homePathEntries.green
];


let homePathArray = [
    ...homePathEntries.blue,
    ...homePathEntries.red,
    ...homePathEntries.yellow,
    ...homePathEntries.green
];


class player_pieces {
    constructor(team, position, score, homePathEntry, playerId, gameEntry) {
        this.team = team;
        this.position = position;
        this.score = score;
        this.homePathEntry = homePathEntry;
        this.id = playerId;
        this.gameEntry = gameEntry;
        this.status = 0; 
        this.intialPosition = position;
    }

    
    unlockPiece() {
        this.status = 1;
        this.position = this.gameEntry;
        let element = document.querySelector(`[piece_id = "${this.id}"]`);
        let toAppendDiv = document.getElementById(this.gameEntry);
        // console.log(element)
        // console.log(toAppendDiv)
        toAppendDiv.appendChild(element);
    }

    
    updatePosition(position) {
        this.position = position;
    }


    movePiece(array) {
        let filteredArray = array;

        if (array.includes(this.homePathEntry)){
            let indexOfPathEntry = array.findIndex( obj=> obj === this.homePathEntry);
            let newSlicedArray = array.slice(0, indexOfPathEntry);

            if(newSlicedArray.length < diceResult){
              let remainingLength = diceResult - newSlicedArray.length;
              let SecondPart = homePathEntries[this.team].slice(0,remainingLength);

              newSlicedArray = newSlicedArray.concat(SecondPart);
            }

            filteredArray = newSlicedArray;
        }
        if(filteredArray.includes('home')){
            teamHasBouns = true;
        }

        moveElementSequentially(this.id, filteredArray);
        this.score += filteredArray.length;
    }


    sentMeToBoard() {
        this.score = 0;
        this.position = this.intialPosition;
        this.status = 0;
        let element = document.querySelector(`[piece_id = "${this.id}"]`);
        let toAppendDiv = document.getElementById(this.intialPosition);
        toAppendDiv.appendChild(element);
    }
}



 let numPvP = parseInt(prompt("Enter The Number Of Players:"));
//  let numPvP = 4;

  

let playerPieces = [];
let boardDetails = [
    { boardColor: 'blue',   board: blue_board,   homeEntry: 'y13', gameEntry: 'b1' },
    { boardColor: 'green',  board: green_board,  homeEntry: 'r13', gameEntry: 'g1' },
    { boardColor: 'red',    board: red_board,    homeEntry: 'b13', gameEntry: 'r1' },
    { boardColor: 'yellow', board: yellow_board, homeEntry: 'g13', gameEntry: 'y1' },
];


for (let i = 0; i < numPvP ; i++) {
    let boardColor = boardDetails[i].boardColor;
    let gameEntry = boardDetails[i].gameEntry;
    let homeEntry = boardDetails[i].homeEntry;

    const parentDiv = document.createElement('div');
    for (let i = 0; i < 4; i++) {
        let span = document.createElement('span');
        let icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-location-pin', 'piece' , `${boardColor}-piece`);
        
        icon.addEventListener('click', (e) => {
            turnForUser(e)
        });
         
        if (boardColor === 'blue'){
            icon.setAttribute('myPieceNum' , i+1);
        }
        
        let PieceID = `${boardColor}${i}`;
        let position = `${i}_${boardColor}`;

        const player = new player_pieces(boardColor, position, 0, homeEntry, PieceID, gameEntry);
        span.setAttribute('id', position);
        icon.setAttribute('piece_id', PieceID);
        playerPieces.push(player);
        span.append(icon);
        parentDiv.append(span);
    }
    boardDetails[i].board.append(parentDiv);
}


if (numPvP === 2) {
    playerTurn = ['blue', 'green'];
} else if (numPvP === 3) {
    playerTurn = ['blue' , 'red', 'green'];
} else if (numPvP === 4) {
    playerTurn = ['blue', 'red' , 'green', 'yellow'];
}





const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const setPlayerTurn = (playerTurnIndex) => {
    if (playerTurnIndex === null || playerTurnIndex === undefined){ 
        return;
    }
      
    let currentTeamTurn = playerTurn[playerTurnIndex];
    
    let boardDetailObject = boardDetails.filter(obj => obj.boardColor === currentTeamTurn);
    boardDetailObject[0].board.classList.toggle('active');
};
setPlayerTurn(0);

const nextTeamTurn = async () => {
    prevPlayerTurnIndex = currentPlayerTurnIndex;

    if (currentPlayerTurnIndex === (playerTurn.length - 1)) {
        currentPlayerTurnIndex = 0;
    } else {
        currentPlayerTurnIndex += 1;
    }


    setPlayerTurn(prevPlayerTurnIndex);
    setPlayerTurn(currentPlayerTurnIndex);

    await delay(500);

    if (playerTurn[currentPlayerTurnIndex] !== 'blue') {
        rollDiceButtonForBot();
    }
};

const giveArrayForMovingPath = (piece) => {
    let indexOfPath;
    let movingArray = [];
    if (!pathArray.includes(piece.position)) {
        indexOfPath = homePathEntries[piece.team].findIndex(elem => elem === piece.position);
        let homePathArrayForPiece = homePathEntries[piece.team];

        for (let i = 0; i < diceResult; i++) {
            if (indexOfPath + 1 < homePathArrayForPiece.length) {
                indexOfPath += 1;
                movingArray.push(homePathArrayForPiece[indexOfPath]);
            } else {
                break;
            }
        }
    } else {
        indexOfPath = pathArray.findIndex(elem => elem === piece.position);
        for (let i = 0; i < diceResult; i++) {
            indexOfPath = (indexOfPath + 1) % pathArray.length;
            movingArray.push(pathArray[indexOfPath]);
        }
    }
    return movingArray;
};



const moveElementSequentially = (elementId, pathArray) => {
    const elementToMove = document.querySelector(`[piece_id="${elementId}"]`);
    let currentTeamTurn = playerTurn[currentPlayerTurnIndex];
    let piece = playerPieces.find(obj => obj.id === elementId);
    let toBreak = false;

    function moveToNextTarget(index) {
        if (index >= pathArray.length || toBreak) return;

        // Play move sound for each step:
        moveSound.pause();        // Stop if already playing
        moveSound.currentTime = 0; // Rewind to start
        moveSound.play();

        const currentTarget = document.getElementById(pathArray[index]);

        if (pathArray[index] === 'home') {
            let indexOfPiece = playerPieces.findIndex(obj => obj.id === piece.id);
            playerPieces.splice(indexOfPiece, 1);
            elementToMove.remove();
            toBreak = true;

            let totalPiecesOfThisTeam = playerPieces.filter(obj => obj.team === currentTeamTurn);

            if (totalPiecesOfThisTeam.length === 0) {
                declareWinner(currentTeamTurn);
                return;
            }

            if (currentTeamTurn === 'blue') {
                currentPlayerTurnStatus = true;
            } else {
                rollMyDice(true);
            }
            return;
        }

        piece.updatePosition(pathArray[index]);
        currentTarget.appendChild(elementToMove);

        setTimeout(() => {
            moveToNextTarget(index + 1);
        }, 170);
    }

    moveToNextTarget(0);
};

const rollMyDice = async (hasBouns) => {
    currentPlayerTurnStatus = true;
    await delay(700);
    if (diceResult === 6 || hasBouns || teamHasBouns) {
        rollDiceButtonForBot();
    } else {
        nextTeamTurn();
        if (playerTurn[currentPlayerTurnIndex] !== 'blue') rollDiceButtonForBot();
    }
};



const moveMyPiece = async (piece) => {
    let array = giveArrayForMovingPath(piece);
    if (array.length < diceResult){ 
        await delay(500);
        currentPlayerTurnStatus = true;
        nextTeamTurn();
    return false;
    }
    piece.movePiece(array);
    await delay(array.length * 175);
    rollMyDice();
    return true;
};


const giveEnemeiesBehindMe = (piece) => {
    let currentTeamTurn = playerTurn[currentPlayerTurnIndex];
    let indexOfPath = pathArray.findIndex(elem => elem === piece.position);
    if (!indexOfPath) {
        return 0;
    }
    let lastSixPath = [];
    for (let i = 6; i > 0; i--) {
        let index = (indexOfPath - i + pathArray.length) % pathArray.length;
        lastSixPath.push(pathArray[index]);
    }
    let opponentsOnPath = playerPieces.filter(obj => lastSixPath.includes(obj.position) && obj.team !== currentTeamTurn);
    return opponentsOnPath.length;
};


const turnForBot = async () => {
    let currentTeamTurn = playerTurn[currentPlayerTurnIndex];
    let totalUnlockedPieces = playerPieces.filter(obj => obj.team === currentTeamTurn && obj.status === 1);
    let totalPiecesOfThisTeam = playerPieces.filter(obj => obj.team === currentTeamTurn).length;
    let isMoving = false;

    if (totalUnlockedPieces.length === 0 && diceResult !== 6) {
        rollMyDice();
        return;
    }
    currentPlayerTurnStatus = true;
    let piece_team = playerPieces.filter(obj => obj.team === currentTeamTurn);
    if (totalUnlockedPieces.length === 0 && diceResult === 6) {
        piece_team[0].unlockPiece();
        rollMyDice();
        return;
    }

    let opponentPieces = playerPieces.filter(obj => obj.team !== currentTeamTurn && obj.status === 1);
        let bounsReached = false;

     for(let i = 0; i < totalUnlockedPieces.length; i++){
        if(bounsReached){
            break;
        }   
     let array =  giveArrayForMovingPath(totalUnlockedPieces[i]);
     let cut = opponentPieces.find(obj => obj.position === array[array.length - 1] && !safePaths.includes(obj.position));
     let homeBouncReached = array[array.length-1] === 'home';
     if (cut) {
       totalUnlockedPieces[i].movePiece(array);
       await delay(array.length * 175);
       cut.sentMeToBoard();
       killSound.play();
       bounsReached = true;
       rollMyDice(true);
       return;
     }
     if(homeBouncReached){
        totalUnlockedPieces[i].movePiece(array);
        await delay(array.length * 175);
        bounsReached = true;
        rollMyDice();
     }
     if (bounsReached) {
        return;
     }
    }




    // Bot has no unlocked pieces
        let lockedPieces = playerPieces.filter(obj => obj.team === currentTeamTurn && obj.status === 0);
        const attempMove = async (piece) => {
            if (!await moveMyPiece(piece)) {
                return false;
            }
            isMoving = true;
            return true
   }
    //One unlocked piece
   if(totalUnlockedPieces.length === 1){
    if (totalUnlockedPieces.length <= 3 && diceResult === 6 ){
        lockedPieces[0].unlockPiece();
        rollMyDice();
        return
    }
    let piece = totalUnlockedPieces.find(obj => obj.status === 1);
    if(!await attempMove (piece));
   }
   // 2 unlocked pieces
   if(totalUnlockedPieces.length === 2){
    if (totalUnlockedPieces.length  <= 3 && diceResult === 6  && totalPiecesOfThisTeam >= 3){
        lockedPieces[0].unlockPiece();
        rollDiceButtonForBot();
        return;
    }

    let pieceSafe = totalUnlockedPieces.filter(obj => safePaths.includes(obj.position));
    let pieceUnsafe = totalUnlockedPieces.filter(obj => !safePaths.includes(obj.position));

    if (pieceSafe.length === 0){
       let scoreOfFirstPiece = pieceUnsafe[0].score;
       let scoreOfSecondPiece = !pieceUnsafe[1].score;

       if( scoreOfSecondPiece > scoreOfFirstPiece ){
        if(!await attempMove(pieceUnsafe[1]))  return;
       } else {
        if(!await attempMove(pieceUnsafe[0])) return;
       }
    }
    if(pieceSafe.length ===  1 ){

        if(!await attempMove(pieceUnsafe[0]))  return;

    }
     
    if (pieceSafe.length === 2 && pieceSafe[0].position === pieceSafe[1].position) {
        if (!await attempMove(pieceSafe[0]))  return;
    }
    if(pieceSafe.length === 2){
        let scoreOfFirstPiece = pieceSafe[0].score;
        let  opponentBeforeFirstPiece = giveEnemeiesBehindMe(pieceSafe[0]);

        let scoreOfSecondPiece = pieceSafe[1].score;
        let opponentBeforeSecondPiece = giveEnemeiesBehindMe(pieceSafe[1]);

        if(opponentBeforeFirstPiece > opponentBeforeSecondPiece ){
        if (!await attempMove(pieceSafe[1]))  return;
        }else if (opponentBeforeSecondPiece > opponentBeforeFirstPiece){
        if (!await attempMove(pieceSafe[0]))  return;
        }else if(opponentBeforeFirstPiece === opponentBeforeSecondPiece) {
          if(scoreOfSecondPiece > scoreOfFirstPiece){
            if (!await attempMove(pieceSafe[1]))  return;
          }else{
            if (!await attempMove(pieceSafe[0]))  return;
          }
        }
    }
}
// 3 unlocked pieces
    if(totalUnlockedPieces.length === 3){
            let pieceSafe = totalUnlockedPieces.filter(obj => safePaths.includes(obj.position));
            let pieceUnsafe = totalUnlockedPieces.filter(obj => !safePaths.includes(obj.position));

    if(pieceSafe.length === 0){
        let scoreOfFirstPiece = pieceUnsafe[0].score;
        let scoreOfSecondPiece = pieceUnsafe[1].score;
        let scoreOfThirdPiece = pieceUnsafe[2].score;


        let greatestScore = Math.max(scoreOfFirstPiece, scoreOfSecondPiece, scoreOfThirdPiece);
        let movingPiece = pieceUnsafe.find(obj => obj.score === greatestScore);
            if(!await attempMove(movingPiece))  return;
    }
    if(pieceSafe.length === 1) {
        let scoreOfFirstPiece = pieceUnsafe[0].score;
        let scoreOfSecondPiece = pieceUnsafe[1].score;

        if (scoreOfSecondPiece > scoreOfFirstPiece ){
            if(!await attempMove(pieceUnsafe[1]))  return;
        }else{
            if(!await attempMove(pieceUnsafe[0]))  return;
        }
      if(pieceSafe.length === 3 && pieceSafe[0].position === pieceSafe[1].position && pieceSafe[0].position === pieceSafe[2].position){
            if(!await attempMove(pieceSafe[0]))  return;
        }
        if(pieceSafe.length === 2){
            if(!await attempMove(pieceUnsafe[0]))  return;
        }
        if(pieceSafe.length === 3){
            let opponentBeforeFirstPiece = giveEnemeiesBehindMe(pieceSafe[0]);
            let opponentBeforeSecondPiece = giveEnemeiesBehindMe(pieceSafe[1]);
            let opponentBeforeThirdPiece = giveEnemeiesBehindMe(pieceSafe[2]);

            if(opponentBeforeFirstPiece < opponentBeforeSecondPiece && opponentBeforeFirstPiece < opponentBeforeThirdPiece){
                if(!await attempMove(pieceSafe[0]))  return;
            }else if(opponentBeforeSecondPiece < opponentBeforeFirstPiece && opponentBeforeSecondPiece < opponentBeforeThirdPiece){
                if(!await attempMove(pieceSafe[1]))  return;
            }else if(opponentBeforeThirdPiece < opponentBeforeFirstPiece && opponentBeforeThirdPiece < opponentBeforeSecondPiece){
                if(!await attempMove(pieceSafe[2]))  return;
            }else{
                let piecesAtHHomePath = piece_team.filter((obj) => obj.status === 1 && homePathArray.includes(obj.position));

                let piecesNotAtHomePath = piece_team.filter((obj) => obj.status === 1 && !homePathArray.includes(obj.position));

                piecesAtHHomePath.sort((a, b) => a.score - b.score);

                if (piecesNotAtHomePath.length > 0) {
                    if (!await attempMove(piecesNotAtHomePath[0])) return;
                }else{
                    for(let i = 0 ; i < piecesAtHHomePath.length; i++){
                        let movingPathArray = giveArrayForMovingPath(piecesAtHHomePath[i]);
                        if (movingPathArray.length ===diceResult){
                            isMoving = true;
                            moveMyPiece(piecesAtHHomePath[i]);
                            break;
                        }
                    }
                }
            }
        }              
    }
    if(!isMoving) {

         for (let piece of totalUnlockedPieces) {
        if (giveArrayForMovingPath(piece).length >= diceResult) {
            isMoving = true;
            await moveMyPiece(piece);
            return;
        }
    }
    nextTeamTurn();
    }
};
}



const turnForUser = async (e) => {
    let isUserTurn = playerTurn[currentPlayerTurnIndex] === 'blue';
    let currentTeamTurn = playerTurn[currentPlayerTurnIndex];

    if (!isUserTurn || currentPlayerTurnStatus) {
        return;
    }
    let totalUnlockedPieces = playerPieces.filter(obj => obj.team === currentTeamTurn && obj.status === 
        1).length;

    let piece = playerPieces.find((obj => obj.id === e.target.getAttribute('piece_id') && obj.team ===
     currentTeamTurn));
    
     let opponentPiece = playerPieces.filter(obj => obj.team !== currentTeamTurn && obj.status ===
         1);
    let array = giveArrayForMovingPath(piece);
    let cut = opponentPiece.find(obj => obj.position === array[array.length - 1] && !safePaths.includes(obj.position));
   
    if (cut) {

        piece.movePiece(array);
        await delay(array.length * 175);
        cut.sentMeToBoard();
        killSound.play();
        currentPlayerTurnStatus = true;
        rollMyDice(true);
        return;
    }


    if (array.length < diceResult){
        await delay (500);
        currentPlayerTurnStatus = true;
        nextTeamTurn();
        return;
    }
    if (diceResult === 6) {
        currentPlayerTurnStatus = true;
        if (piece.status === 0) {
            piece.unlockPiece();
            return;
        }
        piece.movePiece(array);
    } else {
        if (piece.status === 0){
             return;
        }
        currentPlayerTurnStatus = true;
        piece.movePiece(array);
        if (!teamHasBouns) {
            nextTeamTurn();
        }
    }
};



    function showDiceFace(val) {
        switch (val) {
            case 1: dice.style.transform = 'rotateX(0deg) rotateY(0deg)'; break;
            case 6: dice.style.transform = 'rotateX(180deg) rotateY(0deg)'; break;
            case 2: dice.style.transform = 'rotateX(-90deg) rotateY(0deg)'; break;
            case 5: dice.style.transform = 'rotateX(90deg) rotateY(0deg)'; break;
            case 3: dice.style.transform = 'rotateX(0deg) rotateY(90deg)'; break;
            case 4: dice.style.transform = 'rotateX(0deg) rotateY(-90deg)'; break;
        }
    };

    
rollBtn.addEventListener('click', async () => {
    diceRollSound.play();
    let currentTeamTurn = playerTurn[currentPlayerTurnIndex];

    if (!currentPlayerTurnStatus) return;

    rollBtn.disabled = true;
    dice.style.animation = 'rolling 0.6s';
    // diceResult = Math.floor(Math.random() * 6) + 1;
    diceResult = 6;
    showDiceFace(diceResult);


    currentPlayerTurnStatus = false; 
    teamHasBouns = false;

    setTimeout(async () => {
        dice.style.animation = 'none';
        await delay(700);
        rollBtn.disabled = false;

        let totalUnlockedPieces = playerPieces.filter(obj => obj.team === currentTeamTurn && obj.status === 1);

        
        if (totalUnlockedPieces.length === 0 && diceResult !== 6 && !teamHasBouns) {
            await delay(500);
            currentPlayerTurnStatus = true;
            nextTeamTurn();
        }

    }, 600);
});


const rollDiceButtonForBot = async() => {
    diceRollSound.play();
       if (!currentPlayerTurnStatus) return;

        rollBtn.disabled = true;
        dice.style.animation = 'rolling 0.6s';
        diceResult = Math.floor(Math.random() * 6) + 1;
        showDiceFace(diceResult);

        currentPlayerTurnStatus = false;
        teamHasBouns = false;

    setTimeout(async() =>{
        dice.style.animation = 'none'; 
        rollBtn.disabled = false;
        currentPlayerTurnStatus = true;
        turnForBot();
    },700);
}

    


document.addEventListener('keydown', (e)=>{
    let currentTeamTurn = playerTurn[currentPlayerTurnIndex];

    if (currentTeamTurn != 'blue'){
        return
    }

    if (e.key === '1'){
        let piece = document.querySelector (`[myPieceNum = "1"]`);
        piece?.click()
    }
    if (e.key === '2'){
        let piece = document.querySelector (`[myPieceNum = "2"]`);
        piece?.click()
    }
    if (e.key === '3'){
        let piece = document.querySelector (`[myPieceNum = "3"]`);
        piece?.click()
    }
    if (e.key === '4'){
        let piece = document.querySelector (`[myPieceNum = "4"]`);
        piece?.click()
    }
    if (e.code === 'Space') {
       rollBtn.click();
    }
})


const declareWinner = (team) =>{
    let parentDiv = document.createElement('div');
    let childDiv = document.createElement('div');
    let h1 = document.createElement('h1');
    let button = document.createElement('button');


    parentDiv.setAttribute('id','declareWinner');

    h1.textContent = `${team} Won The Game!`;

    button.textContent = 'Play Again';
    button.addEventListener('click' , ()=> {
        location.reload();
    })
    childDiv.append(h1);
    childDiv.append(button);
    parentDiv.append(childDiv);
    document.body.append(parentDiv);
}
