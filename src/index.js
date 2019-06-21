import React, { useReducer, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import originalImage from "./assets/images/original.jpg";

import "./styles.css";

const initialState = {
  pieces: [],
  shuffled: [],
  solved: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        pieces: [...action.payload.pieces],
        shuffled: [...action.payload.shuffled],
        solved: [...action.payload.solved]
      };
    case "DROP":
      const targetBoardName = action.payload.target;
      const targetBoardArray = [...state[targetBoardName]];
      if (targetBoardArray[action.payload.targetIndex]) return state;

      const piecesArray = [...state.pieces];
      const pieceData = { ...piecesArray[action.payload.pieceId] };
      // old board
      const originBoardName = pieceData.board;
      // IMPORTANT CHECK: if target and origin boards are same then they must point to
      // same array otherwise we have 2 copies of same array and at the end,
      // one would overwrite the other
      const originBoardArray =
        originBoardName === targetBoardName
          ? targetBoardArray
          : [...state[originBoardName]];
      // find piece being moved in old board array
      const originPiece = originBoardArray.find(
        el => el && el.order === action.payload.pieceId
      );
      // find its index in this array
      const originPieceIndex = originBoardArray.indexOf(originPiece);
      // remove piece from old position
      originBoardArray[originPieceIndex] = undefined;
      // save new board name in pieces array
      piecesArray[action.payload.pieceId].board = targetBoardName;
      // save it also into moved piece - not needed
      pieceData.board = targetBoardName;
      // save moved piece into new position
      targetBoardArray[action.payload.targetIndex] = pieceData;

      return {
        ...state,
        pieces: piecesArray,
        [originBoardName]: originBoardArray,
        [targetBoardName]: targetBoardArray
      };
    default:
      throw new Error();
  }
};

const shuffle = pieces => {
  const shuffled = [...pieces];

  // Durstenfeld shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { shuffled, solved } = state;

  useEffect(() => {
    const pieces = [...Array(8)].map((_, i) => ({
      filename: `${i + 1}.jpg`,
      order: i,
      board: "shuffled"
    }));

    const payload = {
      pieces,
      solved: [...Array(8)],
      shuffled: shuffle(pieces)
    };

    dispatch({
      type: "INITIALIZE",
      payload
    });
  }, []);

  const handleDragStart = (event, order) => {
    // The dataTransfer object is used to store the data needed to identify
    // what is being dragged. We use the value of the order parameter for such purpose.
    event.dataTransfer.setData("text/plain", order);
  };

  const handleDrop = (event, index, droppedOnBoard) => {
    const pieceOrder = event.dataTransfer.getData("text");
    const pieceOrderTypeNumber = parseInt(pieceOrder, 10);
    dispatch({
      type: "DROP",
      payload: {
        target: droppedOnBoard,
        targetIndex: index,
        pieceId: pieceOrderTypeNumber
      }
    });
  };

  const renderPieceContainer = (piece, index, boardName) => {
    // v src atribute musime zavolat require aby sme dostali spravny nazov
    // suboru a cestu, lebo webpack ich zahashuje pri bundlovani a mi
    // sa potrebujeme aktualny nazov cestu, ine riesenie by bolo dat images do
    // public foldra alebo robit import na zaciatku pre kazdy jeden obrazok
    // keby webpack nemenil nazvy suborov dalo by sa aj tak ze importnem jeden
    // image a zvysok imagov len menim nazov suboru na konci cesty k image
    // keby webpack nemenil ani cestu stacila by len relativna cesta

    // onDragOver - normal behavior of the onDragOver event is to disallow
    // dropping. To overcome this, we’re calling the event.preventDefault() method.
    return (
      <li
        key={index}
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, index, boardName)}
      >
        {piece && (
          <img
            draggable
            src={require(`./assets/images/${piece.filename}`)}
            alt={`${piece.filename}`}
            onDragStart={e => handleDragStart(e, piece.order)}
          />
        )}
      </li>
    );
  };

  console.log(state);
  return (
    <Puzzle>
      <ShuffledBoard>
        {shuffled.map((piece, i) => renderPieceContainer(piece, i, "shuffled"))}
      </ShuffledBoard>
      <SolvedBoard>
        {solved.map((piece, i) => renderPieceContainer(piece, i, "solved"))}
      </SolvedBoard>
    </Puzzle>
  );
}

const Puzzle = styled.div`
  display: flex;
  flex-wrap: wrap;

  li {
    position: relative;
    text-align: left;
    display: inline-block;
    width: 101px;
    height: 305px;
    border: 1px solid #ddd;
    border-width: 0 1px 1px 0;
  }

  li:empty:hover:before {
    opacity: 1;
  }

  li img {
    width: 102px;
    height: 306px;
    position: absolute;
    cursor: grab;
    transition: transform 200ms ease, box-shadow 200ms ease;
  }

  li img:hover {
    z-index: 2;
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
`;

const Board = `
  margin: 20px auto;
  width: 408px;
  list-style-type: none;
  padding: 0;
  font-size: 0;
  border: 1px solid #ddd;
  border-width: 1px 0 0 1px;
`;

const ShuffledBoard = styled.ul`
  ${Board}
`;

const SolvedBoard = styled.ol`
  ${Board}
  position: relative;
  background-size: cover;
  background-image: url(${originalImage});

  &:before {
    content: "";
    background-color: rgba(255, 255, 255, 0.6);
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
`;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
