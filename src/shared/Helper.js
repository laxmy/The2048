const getAllAvailableSpots = grid =>
{
    let availableSpots = []; 
    for(let i=0; i<4; i++)
    {
        for(let j=0; j<4; j++)
        {
            if(grid[i][j] === 0)
            {
               availableSpots.push([i,j]);
            }
        }
    }
    return availableSpots;
}

const chooseOneInRandom = options =>{
    return options.length > 0 ?
    options[Math.floor(Math.random() * options.length)]
    :null;
}

const combineBackward = slice =>
{
    let mergedValue = 0;
    
    for(let i= 0;i < slice.length;i++)
    {
        if(i!==slice.length-1 && slice[i]===slice[i+1])
        {              
            slice[i] = slice[i]+ slice[i+1];
            mergedValue = mergedValue + slice[i];
            slice[i+1] =0;
        }
    }
   return {arraySlice: slice.filter(x=> x!== 0), scoreChange: mergedValue};
}
const combineForward = slice =>
{
    let mergedValue = 0;

    for(let i= slice.length-1;i>=0;i--)
    {
        if(i!==0 && slice[i]===slice[i-1])
        {              
            slice[i] = slice[i]+ slice[i-1];
            mergedValue = mergedValue + slice[i];
            slice[i-1] =0;
        }
    }
   return {arraySlice: slice.filter(x=> x!== 0), scoreChange: mergedValue};
}

const appendZeroes = (values, forward) =>
{
    let NoOfZeroes = 4 - values.length;
    if(NoOfZeroes > 0)
    {
        let zeroes = new Array(NoOfZeroes).fill(0);
        values = forward? [...zeroes,...values]:[...values,...zeroes];
    }
    return values;
}

const areArraysIdentical= (arr1, arr2) =>  {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0;i<arr1.length; i++){
        if (arr1[i] !== arr2[i]){
            return false;
        }
    }
    return true; 
}

export { appendZeroes, combineBackward, combineForward, 
    getAllAvailableSpots,chooseOneInRandom,areArraysIdentical }
