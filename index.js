const { Engine , Render , Runner , World , Bodies , Body , Events } = Matter;
// configuration vars
document.body.style.overflow = "hidden";
const width = 800;
const height = 800;
const cellsHorizontal = 6;
const cellsVertical = 6;

const unitLengthX = width/cellsHorizontal;
const unitLengthY = width/cellsVertical;

const engine =  Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render  = Render.create({
    element: document.body,
    engine:engine,
    options:{
        wireframes:false,
        width: width,
        height: height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width/2,0,width,2,{
    isStatic:true
}),
Bodies.rectangle(width/2,height,width,2,{
    isStatic:true
}),
Bodies.rectangle(0,height/2,2,height,{
    isStatic:true
}),
Bodies.rectangle(width,height/2,2,height,{
    isStatic:true
}),
];

World.add(world, walls);
// Grid Maze generation
const shuffle = (arr)=>{
    let counter=arr.length;
    while (counter>0){
        const index = Math.floor(Math.random()*counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}
// generate grid
const grid = Array(cellsVertical)
    .fill(null)
        .map(()=> Array(cellsHorizontal)
        .fill(false) );
// verticals
const verticals = Array(cellsVertical)
    .fill(null)
        .map(()=> Array(cellsVertical-1)
        .fill(false) );
// horizontals
const horizontals = Array(cellsHorizontal-1)
    .fill(null)
        .map(()=> Array(cellsHorizontal)
        .fill(false) );

const startRow = Math.floor(Math.random()*cellsVertical)
const startColumn = Math.floor(Math.random()*cellsHorizontal)
const stepThroughCell = (row , column)=>{
    // if i have visited the cell at [row,column] , then return 
    if (grid[row][column]){
        return;
    }
    // Mark this cell as being visited
    grid[row][column] = true;
    // Assemble randomly-ordered list of neighbors and also for each neighbor 
    const neighbors = shuffle([
        [row-1 , column, 'up'],
        [row, column+1, 'right'],
        [row+1 , column, 'down'],
        [row, column-1, 'left'],
    ]);
    // Assemble randomly-ordered list for each neighbor 
    for(let n of neighbors){
        const [nextRow, nextCol ,direction] = n;
        // see if that neighbor is out of bounds
        if(nextRow<0 || nextRow>=cellsVertical || nextCol<0 || nextCol>=cellsHorizontal){
        continue;
        }

        // if we have visited that neighbor , continue to next neighbor
        if(grid[nextRow][nextCol]){
        continue;
        }
        // remove a wall from either horizontals or verticals
        if(direction === 'left'){
        verticals[row][column-1] = true;
        }else if(direction === 'right'){
        verticals[row][column] = true;
        }else if(direction === 'up'){
        horizontals[row-1][column] = true;
        }else if(direction === 'down'){
        horizontals[row][column] =true;
        };
        stepThroughCell(nextRow, nextCol);
        // vist that next cell 
    };
    // visit next cell
};
stepThroughCell(startRow, startColumn);
horizontals.forEach((row ,rowIndex) =>{
    row.forEach((open , colIndex)=>{
        if(open){
            return;
        }
        const wall = Bodies.rectangle(
            colIndex * unitLengthX + unitLengthX/2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {isStatic:true , 
                label:'wall' , 
                render:{
                    fillStyle:'blue'
                }
            }
        );
        World.add(world, wall)
    });
});
verticals.forEach((row ,rowIndex) =>{
    row.forEach((open , colIndex)=>{
        if(open){
            return;
        }
        const wall = Bodies.rectangle(
            colIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY/2,
            5,
            unitLengthY,
            {isStatic:true, label:'wall', 
            render:{
                fillStyle:'blue'
            }
        }
        );
        World.add(world, wall)
    });
});
// goal
const goal = Bodies.rectangle(
    width - unitLengthX/2,
    height - unitLengthX/2,
    unitLengthX*0.7,
    unitLengthX*0.7,
    {label:'goal',
     isStatic:true,
    render:{
        fillStyle:'purple'
    }
    }
);
World.add(world,goal)
// ball
const ballRadius = Math.min(unitLengthX,unitLengthY)*0.334;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    {label:'playerBall'}
);
document.addEventListener('keydown', evt =>{
    const {x,y} = ball.velocity;
    if(evt.code === 'KeyW'){
        Body.setVelocity(ball , {x,y: y-4});
    }else if(evt.code === 'KeyS'){
        Body.setVelocity(ball , {x,y:y+4});
    }else if(evt.code === 'KeyA'){
        Body.setVelocity(ball , {x:x-4, y});
    }else if(evt.code === 'KeyD'){
        Body.setVelocity(ball , {x:+4,y});
    }
})
World.add(world,ball)
// Win condition

Events.on(engine , 'collisionStart' , evt =>{
    evt.pairs.forEach((collision)=>{
        const labels = ['playerBall','goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden')
            engine.world.gravity.y = 1;
            world.bodies.forEach(body =>{
                if(body.label === 'wall'){
                    Body.setStatic(body,false);
                }
            })
        }
    })
})

const restart = document.querySelector('#restart');
restart.addEventListener('click',()=>{
location.reload();
});

const lostball = document.querySelector('#lost-ball');
lostball.addEventListener('click',()=>{
location.reload();
});