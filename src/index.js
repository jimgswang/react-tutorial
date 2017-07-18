import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './index.css';

function Square(props) {
  return (
    <button 
      className={"square " + (props.highlight ? "highlight " : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

Square.propTypes = {
  value: PropTypes.string,
  highlight: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

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

Board.propTypes = {
  squares: PropTypes.array.isRequired,
  winners: PropTypes.instanceOf(Set),
  onClick: PropTypes.func.isRequired
};

function PlayingStatus(props) {
  const status = `Next Player: ${props.next}`;
  return (
    <div>
      { status }
    </div>
  );
}

PlayingStatus.propTypes = {
  next: PropTypes.string.isRequired
};

function TiedStatus(props) {
  return (
    <div>
      Tied!  <a href="#" onClick={ () => props.onClick() }> Click to play again </a>
    </div>
  );
}

TiedStatus.propTypes = {
  onClick: PropTypes.func.isRequired
};

function WonStatus(props) {
  const status = `The winner is ${props.winner}`;
  return (
    <div>
      { status }
    </div>
  );
}

WonStatus.propTypes = {
  winner: PropTypes.string.isRequired
};

class Game extends React.Component {

  constructor() {
    super();

    this.state = this.getNewState();
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

  /**
   * Determine if the game has finished by checking that all 9 squares are filled
   * @return {boolean} if the game is finished
   */
  isFinished(squares) {
    return squares.reduce( (finished, square) => {
      return finished && !!square;
    }, true);
  }

  render() {

    const history = this.state.history;
    const current = history[history.length - 1];
    const winner = this.calculateWinner(current.squares);

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
          <div>{ this.getStatus(current.squares) }</div>
          <ol>{ moves }</ol>
        </div>
      </div>
    );
  }

  getStatus(squares) {
    const winner = this.calculateWinner(squares);
    if (winner) {
      return <WonStatus winner={this.state.xIsNext ? 'O' : 'X'} />;
    }
    const finished = this.isFinished(squares);
    if (finished) {
      return <TiedStatus onClick={ () => this.newGame() } />;
    }

    return <PlayingStatus next={this.state.xIsNext ? 'X' : 'O'} />;
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

  newGame() {
    this.setState(this.getNewState());
  }

  getNewState() {
    return {
      xIsNext: true,
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      winningIndexes: null
    };
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
