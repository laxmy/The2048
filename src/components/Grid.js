import React, { Component } from 'react';
import Square from './Square';
import {appendZeroes, combineBackward, combineForward,
    getAllAvailableSpots,areArraysIdentical,chooseOneInRandom} from '../shared/Helper';

const GameOverText = "GAME OVER!";
const GameWonText ="YAY! YOU DID IT!";
const PermittedUndos = 3;

class Grid extends Component
{
    constructor(){
        super();
        this.state={
            currentGrid : new Array(4).fill(0).map(()=>new Array(4).fill(0)),
            currentScore: 0,
            isFirstMove: true,
            isGameOver: false,
            isGameWon: false,
            history: new Array(3),
            undosLeft:PermittedUndos
        };
    } 
    reset = ()=>{
        this.startNewGame();
    }
    undo =()=>{
        if(this.state.undosLeft <= 0)
        {
            return;
        }
        let lastState = this.state.history.pop();
        console.log("Last state:"+ lastState);
        if(lastState !== undefined)
        {
            this.setState(prevState =>({currentGrid:lastState.grid,
                currentScore:lastState.lastScore,
                undosLeft : prevState.undosLeft-1}));
        }
    }
    generateNext = (grid)=>
    { 
        if(grid ==null) return;
        // find a spot
        let spot = chooseOneInRandom(getAllAvailableSpots(grid));
        if(spot != null)
        {
            //what next -2 or 4?
            let random = Math.random();
            let next = random > 0.5? 2: 4;
            grid[spot[0]][spot[1]] = next;   
        }
        return grid;
    }

    isGameWon =(grid)=>
    {
        const valueToLookFor =2048;
        for(let i=0;i<=3;i++)
        {
            if(grid.indexOf(valueToLookFor)!== -1)
            {
               return true;
            }
        }
        return false;
    }

    isGameOver =() =>
    {
        return !(this.slideColumnsUpAndDown(true).anyUpdate ||
               this.slideColumnsUpAndDown(false).anyUpdate ||
               this.slideRowsLeftAndRight(true).anyUpdate ||
               this.slideRowsLeftAndRight(false).anyUpdate);
    }
 
    slideAndCombine = (slice, isForward) =>
    {
      let values = slice.filter(x=> x!== 0);
      let result = isForward? combineForward(values):combineBackward(values);
      result.arraySlice = appendZeroes(result.arraySlice,isForward);
      return result;
    }

    slideColumnsUpAndDown = isSlidingUp =>
    {
        const arrayColumn = (arr, n) => arr.map(x => x[n]); 

        let copy = [...this.state.currentGrid];
        let scoreChange = 0;
        let anythingChanged = false;
        
        for(let i= 0; i<=3;i++)
        {
            let column = arrayColumn(copy,i);
            var result = this.slideAndCombine(column,!isSlidingUp);           
            anythingChanged = anythingChanged || !areArraysIdentical(column, result.arraySlice);

            for(let j=0;j<=3;j++)
            {
                copy[j][i]=result.arraySlice[j];
            }
            scoreChange += result.scoreChange;
        } 

        return { resultingGrid: copy, scoreChange: scoreChange, anyUpdate: anythingChanged }
    }

    slideRowsLeftAndRight = isSlidingRight =>
    {
        let scoreChange = 0;
        let anythingChanged = false;
        let copy = [...this.state.currentGrid];    

        for(let i= 0; i<=3;i++)
        {
            var result = this.slideAndCombine(copy[i],isSlidingRight);
            anythingChanged = anythingChanged || !areArraysIdentical(copy[i], result.arraySlice);
            copy[i] = [...result.arraySlice];
            scoreChange += result.scoreChange;
        } 
        return { resultingGrid: copy, scoreChange: scoreChange, anyUpdate: anythingChanged } 
    }

    checkAndUpdateGrid = result => 
    {
        console.log("check and Update:"+JSON.stringify(result));
        if (result.anyUpdate) 
        {
            result.resultingGrid = this.generateNext(result.resultingGrid);    
            this.updateState(result);
            let anyMoreAvailableSpots = getAllAvailableSpots(this.state.currentGrid);
            if(anyMoreAvailableSpots == null || anyMoreAvailableSpots <= 0)
            {
                if(this.isGameOver())
                {
                  this.setState({isGameOver: true})
                }
            } 
        }
    }


    updateState = proposedState => 
    { 
        let newHistory = [...this.state.history,{grid: this.state.currentGrid, lastScore:this.state.currentScore} ];
        if(newHistory.length > PermittedUndos)
        {
            newHistory.shift();
        }
        console.log("history to keep:"+JSON.stringify(newHistory));
        this.setState(prevState => ({
            currentGrid: proposedState.resultingGrid,
            currentScore: prevState.currentScore + proposedState.scoreChange,
            history: newHistory
        })); 
        
        let isGameWon = this.isGameWon(this.state.currentGrid);
        this.setState(prevState =>({
        isGameOver: isGameWon,
        isGameWon: isGameWon}))
    }

    handleUserInput = event => {

        if(this.state.isGameOver)
        {
            return;
        }
        
        switch(event.key)
        {
            case 'ArrowUp': 
                {
                   var result = this.slideColumnsUpAndDown(true);  
                   this.checkAndUpdateGrid(result);                  
                   break;         
                }                 
            case 'ArrowDown': 
                {
                   result = this.slideColumnsUpAndDown(false);  
                   this.checkAndUpdateGrid(result);        
                   break;         
                }
            case 'ArrowRight':
                {
                    result = this.slideRowsLeftAndRight(true); 
                    this.checkAndUpdateGrid(result);        
                    break;            
                }
            case 'ArrowLeft': 
                {
                    result = this.slideRowsLeftAndRight(false);
                    this.checkAndUpdateGrid(result);        
                    break;    
                }
            default: break;
        }
    }

   
    componentWillMount()
    { 
        if(this.state.isFirstMove)
        {
            this.startNewGame();
        }
    }

    startNewGame() {
        let newGrid = {
            currentGrid : new Array(4).fill(0).map(()=>new Array(4).fill(0)),
            currentScore: 0,
            isFirstMove: true,
            isGameOver: false,
            isGameWon :false,
            history:new Array(3),
            undosLeft:PermittedUndos
        };
        let result = this.generateNext(newGrid.currentGrid);
        let result2 = this.generateNext(result);
        this.setState(prevState => ({...newGrid, isFirstMove: false, currentGrid: result2 }));
    }

    render()
    {
     let overlayDisplayStyle = this.state.isGameOver?{display:"flex"}:{display:"none"}
     let overlayText = this.state.isGameWon? GameWonText: GameOverText;
     return (
         <div className="grid-container">
            <h1>Score: {this.state.currentScore} </h1>
            <div className="options">
                <button className="yellowBtn" onClick={this.reset}>NEW GAME</button>
                <div>
                    <button className="yellowBtn" onClick={this.undo}>UNDO</button>
                    <p>{this.state.undosLeft > 0? this.state.undosLeft: "No "} UNDOs left!</p>
                </div>
            </div>
            
            <div className="Grid" onKeyPress={() =>this.handleUserInput()}>            
                { this.state.currentGrid.map((row,rowIndex) => 
                    (<div key={"row"+rowIndex} className="Row">
                        {row.map((cell,cellIndex) => 
                            (<Square key={cellIndex} Number={cell} /> ))}
                    </div>))
                }
            <div className="grid-overlay" style={overlayDisplayStyle}>
                <div className="overlay-text"><p>{overlayText}</p></div>
            </div>
            </div>
        </div>)
    }

 
    componentDidMount()
    {
        document.addEventListener('keydown',this.handleUserInput);
    }
    componentWillUnmount()
    {
        document.removeEventListener('keydown',this.handleUserInput);
    }
}

export default Grid;