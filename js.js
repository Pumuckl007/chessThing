var game = new Chess();
var status = "";
var scores = {"n":2,"p":1,"b":3,"r":5,"q":9};
var onDragStart = function (source, piece, position, orientation) {
  if (game.game_over() === true ||
    (game.turn() === 'w' && piece.search(/^b/)) !== -1 && false) {
    return false;
  }
};
var onDrop = function (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  updateStatus();
};

var updateStatus = function () {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }
  console.log(status);
  if(game.turn() === 'b'){
    var move = chooseMove(game.BLACK);
    game.move(move);
    board.position(game.fen());
  }
};

var chooseMove = function (color){
  var moves = game.moves({verbose: true});
  var aiBoard = new Chess();
  var bestMove = moves[0];
  moves.forEach(function (move, index){
    move.score = 0;
    if(move.captured){
      move.score = scores[move.captured];
    }
    var preMoveProtectionScore = getNumberOfProtections(aiBoard, color);
    aiBoard.load(game.fen());
    aiBoard.move(move);
    var postMoveProtectionScore = getNumberOfProtections(aiBoard, color);
    move.score += postMoveProtectionScore - preMoveProtectionScore;
    if(move.score > bestMove.score){
      bestMove = move;
    }
    if(move.score = bestMove.score){
      if(Math.random()>0.5){
        bestMove = move;
      }
    }
  })

  // for(var i = 0; i<moves.length; i++){
  //   if(game.get(moves[i].to) != null){
  //     return moves[i];
  //   }
  // }
  return bestMove;
}

var getNumberOfProtections = function (chess, color){
  var boardProtectionScore = 0;
  var pieces = [];
  chess.SQUARES.forEach(function (square){
    if(chess.get(square)){
      if(chess.get(square).color === color){
        pieces.push(square);
      }
    }
  });
  var resetBoard = chess.fen();
  pieces.forEach(function (piece){
    if(chess.get(piece).type === "k"){
      return;
    }
    var protections = 0;
    console.log(chess.turn());
    chess.load(resetBoard);
    var scoreOfPiece = scores[chess.get(piece).type];
    if(color === "b"){
      chess.put({type: chess.PAWN, color: chess.WHITE}, piece);
    } else{
      chess.put({type: chess.PAWN, color: chess.BLACK}, piece);
    }
    console.log(chess.turn());
    chess.moves({verbose:true}).forEach(function (move){
      if(move.captured){
        if(move.to === piece){
          protections ++;
          console.log(move.from);
          console.log(move.to);
          console.log(chess.ascii());
          console.log("--");
        }
      }
    });
    boardProtectionScore += protections*scoreOfPiece;
  });
  return boardProtectionScore;
}

var onMoveEnd = function (oldPos,newPos){
  board.position(game.fen());
}
var reset = function (){
  board.clear();
  board.start();
  game.reset();
}

var board = new ChessBoard('board', {
  draggable: true,
  dropOffBoard: 'trash',
  sparePieces: false,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMoveEnd: onMoveEnd
});
$('#startBtn').on('click', board.start);
$('#clearBtn').on('click', reset);
