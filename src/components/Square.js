import React, { Component } from 'react';
import '../App.css';
import { SquarePalette } from '../shared/palette';

let style ={
    color: SquarePalette["contrastDefaultColor"]
}

class Square extends Component{
   
    render()
    {   
        let squareStyle={...style,backgroundColor:SquarePalette[this.props.Number]};
        if(this.props.Number> 16)
        {
            squareStyle.color=SquarePalette["contrastDefaultLightColor"];
        } 
        console.log("Render");
        let value = this.props.Number > 0? this.props.Number:""; 
        return(   
            
              <div className="Square" style={squareStyle}>          
               <div>{ value }</div>          
              </div>)       
             }
}

export default Square;