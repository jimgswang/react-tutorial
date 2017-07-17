import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button 
      className={"square " + (props.highlight ? "highlight " : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {

  renderSquare(i) {
    const highlight = !!this.props.winners && this.props.winners.has(i);

    return (
      <Square 
        value={ this.props.squares[i] }
        highlight= { highlight }
        onClick={ () => this.props.onClick(i) }
      />
    );
  }

  render() {

    const squares = this.props.squares;

    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {

  constructor() {
    super();

    this.state = {
      xIsNext: true,
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      winningIndexes: null
    }
  }

  /**
   * return the set of winning indexes if there is a winner
   * or null if no winner
   * */
  calculateWinner(squares) {

    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4 ,7],
      [2, 5 ,8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return new Set(lines[i]);
      }
    }

    return null;
  }

  render() {

    const history = this.state.history;
    const current = history[history.length - 1];
    const winner = this.calculateWinner(current.squares);
    const currentPlayer = this.state.xIsNext ? 'O' : 'X';

    const status = winner ? 'Winner: ' + currentPlayer : 'Next Player: ' + (this.state.xIsNext ? 'X' : 'O');

    const moves = history.map( (step, moveNumber) => {
      const desc = moveNumber ? 'Move #' + moveNumber : 'Game Start';

      return (
        <li key={moveNumber}>
          <a href="#" onClick={ () => this.jumpTo(moveNumber) }> {desc} </a>
        </li>
      );
    });

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={ current.squares }  
            winners={ winner }
            onClick={ (i) => this.handleClick(i) } 
          />
        </div>
        <div className="game-info">
          <div>{ status }</div>
          <ol>{ moves }</ol>
        </div>
      </div>
    );
  }

  handleClick(i) {
    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winner = this.calculateWinner(squares);

    if (winner) {
      this.setState(Object.assign({}, this.state, {
        winningIndexes: winner
      }));
      return;
    }

    if (squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      xIsNext: !this.state.xIsNext,
      moveNumber: ++this.state.moveNumber,
      winningIndexes: null
    });
  }

  jumpTo(moveNumber) {
    const history = this.state.history.slice(0, moveNumber + 1);
    const current = history.slice(history.length - 1);
    const xIsNext = moveNumber % 2 === 0;

    this.setState({
      history: history,
      xIsNext: xIsNext,
      stepNumber: moveNumber,
      winningIndexes: this.calculateWinner(current)
    });
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
