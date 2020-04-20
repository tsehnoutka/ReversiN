//****************************************************************************
//                           Game stuff
//****************************************************************************
//  Variables
const PLAYER1 = 0;
const PLAYER2 = 1;
const OPEN_SPACE = -1;
const UNPLAYABLE = -2;
const PLAYER1_COLOR = "black";
const PLAYER2_COLOR = "white";
const PLAYER1_FILE = "img/pieceDark.png";
const PLAYER2_FILE = "img/pieceLight.png";
const PLAYER1_SHADE_FILE = "img/pieceDarkPossibleMove.png";
const PLAYER2_SHADE_FILE = "img/pieceLightPossibleMove.png";
const OPEN_FILE = "img/greenSquare.png";
const DK_SCORE = document.getElementById("dkScr");
const LT_SCORE = document.getElementById("ltScr");
const TXT_INPUT = document.querySelector("#input");

var board = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];

var player = PLAYER1; // 0 for player 1, 1 for player 2
var boxesTaken = 0;
var won = false;
var displayMessage = false;
var twoNoMovesInARow = 0;
var gameOn = true;

var done = false;
var yourTurn = false;
var recievedPlayAgain = false;
var outputMessage = ""
var displayMessage = false;

function initializeBoard() {
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      board[y][x] = UNPLAYABLE;
      let strID = "i" + y + "" + x;
      document.getElementById(strID).src = OPEN_FILE;
    }
  board[3][3] = PLAYER1;
  document.getElementById("i33").src = PLAYER1_FILE;
  board[3][4] = PLAYER2;
  document.getElementById("i34").src = PLAYER2_FILE;
  board[4][3] = PLAYER2;
  document.getElementById("i43").src = PLAYER2_FILE;
  board[4][4] = PLAYER1;
  document.getElementById("i44").src = PLAYER1_FILE;
  shadeBoxes(player);
  winner();
}


//  for Save / Load feature
var moves = new Array(); //  this holds the player # and the move that player made
var moveIndex = 0;

jQuery(document).ready(function($) {
  initializeBoard();

  //  create the event handlers for each box of the game
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      let eleID = "#" + y + "" + x;
      let tempEle = $(eleID);
      $(eleID).on("click", function(event) {
        let y = this.id.substring(0, 1);
        let x = this.id.substring(1);
        let id = y + "" + x;

        makeMove(0, id, 0, true);
        if (displayMessage)
          PopUpMessage(outputMessage);
        displayMessage = false;
      }); //  end of creating click function
    } //  end of for x
}); //  end document ready function

function is_iPhone_or_iPod() {
  return navigator.platform.match(/iPad/i) ||
    navigator.platform.match(/iPhone/i) ||
    navigator.platform.match(/MacIntel/i)
}

/*******************************************************************************
 **    Make move
 *******************************************************************************/
//  game -string -  1-9 location of the sub gameLocation
//  id - string - 111 -033  <game<y><x>
//  box - integer - <y><x>
//  Ckech Whose Turn - Boolean -we don't want to check whose turn it is if it
//                     a message from the server
function makeMove(game, strId, box, checkWhoseTurn) {
  console.log("makeMove(\"" + strId + "\");");
  let y = parseInt(strId.substring(0, 1));
  let x = parseInt(strId.substring(1));

  if (!gameOn)
    return;
  //addMessage("System", navigator.platform, "red", new Date().getTime());
  //console.log(navigator.platform);
  if (!is_iPhone_or_iPod())
    TXT_INPUT.focus(); //  give the text box the focus

  if (boxesTaken > 63) { // game over
    PopUpMessage("Please start another game");
    return;
  }

  //  if you are not clicking in an OPEN_SPACE square. exit function
  if (board[y][x] != OPEN_SPACE) {
    PopUpMessage("Please a valid move ( one of the shaded squares)");
    return;
  }

  if (checkWhoseTurn)
    if (!yourTurn) {
      outputMessage = "NOT your turn !!";
      displayMessage = true;
      return;
    }

  //  the square is OPEN_SPACE
  let colorFile = (player == PLAYER1) ? PLAYER1_FILE : PLAYER2_FILE;
  document.getElementById("i" + strId).src = colorFile; // paint it player one's color
  //document.getElementById(strId).style.backgroundColor = url(colorFile); // paint it player one's color
  board[y][x] = player; //  put this square's id in the array
  boxesTaken++;
  clearShadeBoxes();
  flipSquares(x, y, colorFile);

  if (winner()) {
    PopUpMessage("press reset to Play again");
    return;
  }

  player = (player ^ PLAYER1) ? PLAYER1 : PLAYER2; //  change player
  shadeBoxes(player); //  sahde the next player's available moves

  //  set next turn color
  let color = (player == PLAYER1) ? PLAYER1_COLOR : PLAYER2_COLOR;
  document.getElementById("turnbox").style.backgroundColor = color;

  if (checkWhoseTurn) {
    SendTurn(strId);
  }
  //document.getElementById('Undo').disabled = false;
} //  end make move  function

/*******************************************************************************
 **    Do we have a winner ??
 *******************************************************************************/
function winner() {
  let p1Count = 0;
  let p2Count = 0;
  let retVal = false;

  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      if (board[y][x] == PLAYER1)
        p1Count++;
      if (board[y][x] == PLAYER2)
        p2Count++;
    }

  DK_SCORE.value = p1Count;
  LT_SCORE.value = p2Count;

  if (boxesTaken > 63) {
    if (p1Count > p2Count)
      PopUpMessage("Dark Player won");
    if (p1Count < p2Count)
      PopUpMessage("Light Player won");
    if (p1Count == p2Count)
      PopUpMessage("It's a tie!");
    retVal = true;
  } else if (twoNoMovesInARow == 2) {
    PopUpMessage("Now More Valid moves");
    if (p1Count > p2Count)
      PopUpMessage("Dark Player won");
    if (p1Count < p2Count)
      PopUpMessage("Light Player won");
    if (p1Count == p2Count)
      PopUpMessage("It's a tie!");
    retVal = true;
  }

  return retVal;

}

/*******************************************************************************
 **     Clear the Shadeboxes
 *******************************************************************************/
function clearShadeBoxes() {
  //  change the available spaces to be just a green space
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++)
      if (board[y][x] == OPEN_SPACE) {
        board[y][x] = UNPLAYABLE;
        let tmpID = "i" + y + "" + x;
        document.getElementById(tmpID).src = OPEN_FILE;
      }
}

/*******************************************************************************
 **    Shadeboxes
 *******************************************************************************/
function shadeBoxes(player) {
  /*  Valid Moves
  Dark must place a piece with the dark side up on the board, in such a position
  that there exists at least one straight (horizontal, vertical, or diagonal)
  occupied line between the new piece and another dark piece, with one or more
  contiguous light pieces between them.
  */
  /*
  find a black,  move in a direction while the square is white.
  do this until the suare is free.  this is a valid move.
     - set teh array to -1,
     - increment blackValidMove
   do this for all black pieces in all directions
  */
  const otherPlayer = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;
  const colorFile = (player == PLAYER1) ? PLAYER1_SHADE_FILE : PLAYER2_SHADE_FILE;
  let totCount = 0; // the number of valid moves
  let count = 0;
  let x = 0;
  let y = 0;
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      if (board[y][x] == player) {
        //  check in each direction for other player and open spot
        // left
        i = x - 1;
        count = 0;
        while (board[y][i] == otherPlayer && i >= 0) {
          i--;
          count++;
        }
        if (count && board[y][i] == UNPLAYABLE) {
          let tmpID = "i" + y + "" + i;
          board[y][i] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // right
        i = x + 1;
        count = 0;
        while (board[y][i] == otherPlayer && i < 8) {
          i++;
          count++;
        }
        if (count && board[y][i] == UNPLAYABLE) {
          let tmpID = "i" + y + "" + i;
          board[y][i] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // up
        j = y - 1;
        count = 0;
        while (board[j][x] == otherPlayer && j >= 0) {
          j--;
          count++;
        }
        if (count && board[j][x] == UNPLAYABLE) {
          let tmpID = "i" + j + "" + x;
          board[j][x] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // down
        j = y + 1;
        count = 0;
        while (board[j][x] == otherPlayer && j < 8) {
          j++;
          count++;
        }
        if (count && board[j][x] == UNPLAYABLE) {
          let tmpID = "i" + j + "" + x;
          board[j][x] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // upper left
        i = x - 1;
        j = y - 1;
        count = 0;
        while (board[j][i] == otherPlayer && j >= 0 && i >= 0) {
          j--;
          i--;
          count++;
        }
        if (count && board[j][i] == UNPLAYABLE) {
          let tmpID = "i" + j + "" + i;
          board[j][i] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // upper right
        i = x + 1;
        j = y - 1;
        count = 0;
        while (board[j][i] == otherPlayer && j >= 0 && i < 8) {
          j--;
          i++;
          count++;
        }
        if (count && board[j][i] == UNPLAYABLE) {
          let tmpID = "i" + j + "" + i;
          board[j][i] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // lower left
        i = x - 1;
        j = y + 1;
        count = 0;
        while (board[j][i] == otherPlayer && j < 8 && i >= 0) {
          j++;
          i--;
          count++;
        }
        if (count && board[j][i] == UNPLAYABLE) {
          let tmpID = "i" + j + "" + i;
          board[j][i] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
        totCount += count;

        // lower right
        i = x + 1;
        j = y + 1;
        count = 0;
        while (board[j][i] == otherPlayer && j < 8 && i < 8) {
          j++;
          i++;
          count++;
        }
        if (count && board[j][i] == UNPLAYABLE) {
          let tmpID = "i" + j + "" + i;
          board[j][i] = OPEN_SPACE;
          document.getElementById(tmpID).src = colorFile;
        }
      } //  end if player
    }
  if (totCount == 0)
    twoNoMovesInARow++
  else
    twoNoMovesInARow = 0;

} //end shade Boxes

/*******************************************************************************
 **    Reset
 *******************************************************************************/
function Reset() {
  boxesTaken = 0;
  won = false;
  displayMessage = false;
  twoNoMovesInARow = 0;
  initializeBoard();
}

/*******************************************************************************
 **    flipSquares
 *******************************************************************************/
function flipSquare(y, x, color) {
  board[y][x] = player;
  let tmpStrID = "i" + y + "" + x;
  document.getElementById(tmpStrID).src = color;
}

function flipSquares(x, y, color) {
  //  check to see if we need to switch colors
  //check left
  let i = x - 1; //  the test x variable
  let j = y; //  the test y variable
  let found = false;
  let opCount = 0; //  the number of oponent squares inbetween mine
  while (i >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    i--;
  }
  if (found) {
    i += 2; //  remove the decrement from above and move one more to the right
    if (x - i == opCount)
      for (i; i <= x; i++) {
        flipSquare(j, i, color);
        /*
        board[j][i] = player;
        let tmpStrID = "i" + j + "" + i;
        document.getElementById(tmpStrID).src = color;
        */
      }
  }

  //check right
  i = x + 1; //  the test x variable
  j = y; //  the test y variable
  found = false;
  opCount = 0;
  while (i < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    i++;
  }
  if (found) {
    i -= 2; //  remove the increment from above and move one more to the left
    if (i - x == opCount)
      for (i; i > x; i--) {
        flipSquare(j, i, color);
      }
  }

  //check up
  i = x; //  the test x variable
  j = y - 1; //  the test y variable
  found = false;
  opCount = 0;
  while (j >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j--;
  }
  if (found) {
    j += 2; //  remove the decrement from above and move one more down
    if (y - j == opCount)
      for (j; j < y; j++) {
        flipSquare(j, i, color);
      }
  }

  //check down
  i = x; //  the test x variable
  j = y + 1; //  the test y variable
  found = false;
  opCount = 0;
  while (j < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j++;
  }
  if (found) {
    j -= 2; //  remove the increment from above and move one more up
    if (j - y == opCount)
      for (j; j > y; j--) {
        flipSquare(j, i, color);
      }
  }

  //  check diagonal up / left - both minus
  i = x - 1;
  j = y - 1;
  found = false;
  while (j >= 0 && i >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j--;
    i--;
  }
  if (found) {
    i += 2; //  remove the decrement from above and move one more to the right
    j += 2; //  remove the decrement from above and move one more to the down
    if (j - y == opCount)
      for (j, i; j < y && i < x; j++, i++) {
        flipSquare(j, i, color);
      }
  }

  //  check diagonal up / right  -  y minus / x plus
  i = x + 1;
  j = y - 1;
  found = false;
  while (j >= 0 && i < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j--;
    i++;
  }
  if (found) {
    i -= 2; //  remove the increment from above and move one more to the left
    j += 2; //  remove the decrement from above and move one more to the down
    if (j - y == opCount)
      for (j, i; j < y && i > x; j++, i--) {
        flipSquare(j, i, color);
      }
  }
  // check diagonal down / left  - y plus / x minus
  i = x - 1;
  j = y + 1;
  found = false;
  while (j < 8 && i >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j++;
    i--;
  }
  if (found) {
    i += 2; //  remove the increment from above and move one more to the right
    j -= 2; //  remove the decrement from above and move one more up
    if (j - y == opCount)
      for (j, i; j > y && i < x; j--, i++) {
        flipSquare(j, i, color);
      }
  }
  // check diagonal down / right  - both plus
  i = x + 1;
  j = y + 1;
  found = false;
  while (j < 8 && i < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j++;
    i++;
  }
  if (found) {
    i -= 2; //  remove the increment from above and move one more to the left
    j -= 2; //  remove the decrement from above and move one more up
    if (j - y == opCount)
      for (j, i; j > y && i > x; j--, i--) {
        flipSquare(j, i, color);
      }
  }
}

/*******************************************************************************
 **    Undo
 *******************************************************************************/
function Undo() {
  var previousID = previousIDs.pop();
  var previousGame = previousID.substring(0, 1) - 1;
  var strP_Box = previousID.slice(2);
  var previousBox = parseFloat(strP_Box);
  var previousPlayer = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;

  //  need to figure out if the sub gane was just won
  player1WinBox = playerScore[PLAYER1][OUTERGAME].indexOf(gameLocation[previousGame]);
  if (player1WinBox != -1) { //  if so, remove winning game from OUTERGAME
    playerScore[PLAYER1][OUTERGAME].splice(playerScore[player][previousGame].indexOf(previousBox), 1);
  }
  player2WinBox = playerScore[PLAYER2][OUTERGAME].indexOf(gameLocation[previousGame]);
  if (player2WinBox != -1) { //  if so, remove winning game from OUTERGAME
    playerScore[PLAYER2][OUTERGAME].splice(playerScore[PLAYER2][OUTERGAME].indexOf(gameLocation[previousGame]), 1);
  }

  //  clear the board
  for (g = 0; g < 9; g++) // game
    for (y = 1; y <= 3; y++)
      for (x = 1; x <= 3; x++) {
        myIndex = g + 1 + "." + y + "." + x;
        if ((document.getElementById(myIndex).style.backgroundColor == PLAYER2_SHADE) ||
          (document.getElementById(myIndex).style.backgroundColor == PLAYER1_SHADE))
          document.getElementById(myIndex).style.backgroundColor = ""
      } //  end for y
  //  remove the move from the array
  playerScore[previousPlayer][previousGame].splice(playerScore[player][previousGame].indexOf(previousBox), 1);

  //  put board back the way it was
  for (y = 1; y <= 3; y++)
    for (x = 1; x <= 3; x++) {
      myIndex = previousGame + 1 + "." + y + "." + x;
      thisBox = parseFloat(y + "." + x);;
      document.getElementById(myIndex).style.backgroundColor = "";
      inPlayer1Array = playerScore[PLAYER1][previousGame].indexOf(thisBox);
      inPlayer2Array = playerScore[PLAYER2][previousGame].indexOf(thisBox);
      if (inPlayer1Array != -1)
        document.getElementById(myIndex).style.backgroundColor = PLAYER1_COLOR
      if (inPlayer2Array != -1)
        document.getElementById(myIndex).style.backgroundColor = PLAYER2_COLOR
    }

  var lastshade = (player != PLAYER1) ? PLAYER1_SHADE : PLAYER2_SHADE;
  player = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;
  var lastcolor = (player == PLAYER1) ? PLAYER1_COLOR : PLAYER2_COLOR;

  //  shade the game for posible moves
  if (1 != boxesTaken) {
    shadeBoxes(previousGame, lastshade);
  }

  document.getElementById("turnbox").style.backgroundColor = lastcolor;
  boxesTaken--;
  currentGameNumber = previousGame;
  playerScore[player][previousGame].indexOf(previousBox);
  document.getElementById('Undo').disabled = true;
}


// got the modal code form:
//  https://www.w3schools.com/howto/howto_css_modals.asp
function PopUpMessage(message) {
  var modal = document.getElementById("myModal");
  var modalContent = document.getElementById("mc");
  modalContent.innerHTML = "<br><span id=\"spanID\" class=\"close\" onclick=\"spanClicked()\">x</span><br><br><p>" + message + "</p><br>";
  //modalContent.textContent= ???;
  modal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
function spanClicked() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function windowClicked(event) {
  var modal = document.getElementById("myModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
