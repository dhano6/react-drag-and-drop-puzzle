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

const renderPieceContainer = (piece, index, boardName) => {
  return (
    <li key={index}>
      {piece && (
        <img
          src={require(`./assets/images/${piece.filename}`)}
          alt={`${piece.filename}`}
        />
      )}
    </li>
  );
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
