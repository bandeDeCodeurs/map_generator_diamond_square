function setup() {

    SIZE = 8; // !!! Should not exceed 8
    GRID_SIZE = 2**SIZE + 1; // Final size map
    TILE_SIZE = 3;
    OFFSET_X = 40;
    OFFSET_Y = 40;
    INTERACTIVE_MODE = false; //If true, can see steps hitting RIGHT_ARROW
    COLOR_MAP = {
        1:"#052F66", // very deep sea
        2:"#004AAD", // deep sea
        3:"#38B6FF", // sea
        4:"#0CC0DF", // lagoon
        5:"#5CE1E6", // transparent water
        6:"#FFDE59", // beach
        7:"#FFBD59", // sand/land
        8:"#C28221", // land
        9:"#96651B", // mud
        10:"#7ED957",// light grass
        11:"#05AD5C",// grass
        12:"#545454",// dark rock
        13:"#737373",// grey rock
        14:"#A6A6A6",// light grey rock
        15:"#D9D9D9",// very light grey rock
        16:"#FFFFFF" // snow
    }
    SHRINK_COEFF_RANDOM = .45;
    
    grid = [];
    range_height = [1, 16];
    range_random = [-8, 4];
    step = 1;

    tmp_size = GRID_SIZE; // for interactive mode

    createCanvas(1900, 940);

    initGrid();

    if (!INTERACTIVE_MODE) {
        calculateHeights(GRID_SIZE);
        fixHeightAlonePoints(8);
        drawHeightMap();
        generateBorders();
    }
}

function draw() {

    //clear();
    //displayDebug();
}

function calculateHeights(size) {

    let rd = getRdm();

    for (let x=0;x<2**(step-1);x++){
        for (let y=0;y<2**(step-1);y++){
            squareStep(x * (size - 1), y * (size - 1), size, rd);
            diamondStep(x * (size - 1), y * (size - 1), size, rd);
        }
    }

    shrinkRangeRandom();
    step++;

    if (INTERACTIVE_MODE) {

        return ((size + 1) / 2);
    } else {

        if (size > 3) {
            calculateHeights((size + 1) / 2);
        }
    }
}

function keyReleased() {

    if (keyCode === RIGHT_ARROW && INTERACTIVE_MODE) {

        if (tmp_size >= 3){

            tmp_size = calculateHeights(tmp_size);
        }
    }
}

function initGrid() {

    for (let x = 0; x < GRID_SIZE; x++) {
        grid[x] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            grid[x][y] = new Point(x,y);
            //We set random height for corners
            if (
                (x == 0 && y == 0) ||
                (x == GRID_SIZE - 1 && y == 0) ||
                (x == GRID_SIZE - 1 && y == GRID_SIZE - 1) ||
                (x == 0  && y == GRID_SIZE - 1)
            ) {
                grid[x][y].height = getRdmHeight();
            }
        }
    }
}

function squareStep(topX, topY, size, rd) {

    let index = {};

    index.x = (size + 1)  / 2 + topX - 1; 
    index.y = (size + 1)  / 2 + topY - 1; 

    grid[index.x][index.y].height = calculateAverage([
        
        grid[topX][topY].height, //top letf corner
        grid[topX + size-1][topY].height, //top right corner
        grid[topX + size-1][topY + size - 1].height, // bottom right corner
        grid[topX][topY + size - 1].height //bottom left corner
    ]) + rd;
}

function diamondStep(topX, topY, size, rd) {

    let tl = grid[topX][topY].height; //top left
    let tr = grid[topX + size-1][topY].height; //top right
    let br = grid[topX + size-1][topY + size - 1].height; //bottom right
    let bl = grid[topX][topY + size - 1].height; // bottom left
    let center = grid[(size - 1) / 2 + topX][(size - 1) / 2 + topY].height //center

    //top
    grid[(size - 1) / 2 + topX][topY].height = calculateAverage([tl,tr,center]) + rd;
    //right
    grid[topX + size-1][(size - 1) / 2 + topY].height = calculateAverage([tr,br,center]) + rd;
    //bottom
    grid[(size - 1) / 2 + topX][size - 1 + topY].height = calculateAverage([br,bl,center]) + rd;
    //left
    grid[topX][(size - 1) / 2 + topY].height = calculateAverage([bl,tl,center]) + rd;
}

function shrinkRangeRandom() {

    let new_range_random = [];
    new_range_random[0] = range_random[0] * SHRINK_COEFF_RANDOM;
    new_range_random[1] = range_random[1] * SHRINK_COEFF_RANDOM;
    range_random = new_range_random
}

function drawHeightMap() {

    noStroke();
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            
            let height = Math.round(grid[x][y].height)
            if (height < range_height[0]) {height = range_height[0];}
            if (height > range_height[1]) {height = range_height[1];}
            //print(height);
            let col = color(COLOR_MAP[height]);
            fill(col);
            rect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function generateBorders() {

    for (let cx=0;cx<GRID_SIZE;cx++) {
        for (let cy=0;cy<GRID_SIZE;cy++) {
        
            let height = roundHeight(grid[cx][cy].height);

            //If that's a beach
            if (height == 6) {
                //we take four neigbours
                north = {dir:"north", x:cx, y:cy-1};
                east  = {dir:"east", x:cx+1, y:cy};
                south = {dir:"south", x:cx, y:cy+1};
                west  = {dir:"west", x:cx-1, y:cy};

                neighbours = [north, east, south, west];

                neighbours.forEach(n => {
                    
                    //we only want a neighbour in the map and only water
                    if (n.x != -1 && 
                        n.y != -1 && 
                        n.x != GRID_SIZE && 
                        n.y != GRID_SIZE && 
                        roundHeight(grid[n.x][n.y].height) == 5
                        ) {

                        traceBorder(cx, cy, n.dir, "#DAFEFF");
                    }
                });
            }
        }
    }
}

function traceBorder(x, y, dir, col) {

    switch(dir) {

        case "north" : {
            p1 = {x:x*TILE_SIZE, y:y*TILE_SIZE};
            p2 = {x:x*TILE_SIZE + TILE_SIZE, y:y*TILE_SIZE};
        }
        break;
        case "east" : {
            p1 = {x:x*TILE_SIZE + TILE_SIZE, y:y*TILE_SIZE};
            p2 = {x:x*TILE_SIZE + TILE_SIZE, y:y*TILE_SIZE + TILE_SIZE};
        }
        break;
        case "south" : {
            p1 = {x:x*TILE_SIZE, y:y*TILE_SIZE + TILE_SIZE};
            p2 = {x:x*TILE_SIZE + TILE_SIZE, y:y*TILE_SIZE + TILE_SIZE};
        }
        break;
        case "west" : {
            p1 = {x:x*TILE_SIZE, y:y*TILE_SIZE};
            p2 = {x:x*TILE_SIZE, y:y*TILE_SIZE + TILE_SIZE};
        }
        break;
    }

    stroke(col);
    line(p1.x, p1.y, p2.x, p2.y);
}

function fixHeightAlonePoints(maxPoints) {

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            
            let current_height = roundHeight(grid[x][y].height);
            let neighbours = getNeighbours(x,y);
            let count = 0;
            let new_height;

            neighbours.forEach(el => {
                if (roundHeight(el.height) != current_height) {
                    count++;
                    new_height = el.height;
                }
            });

            //totally alone
            if (count >= maxPoints) {grid[x][y].height = new_height;}
        }
    }
}

//Helper fctos
function getNeighbours(cx,cy) {

    let res = [];

    for (let x = cx-1;x<=cx+1;x++) {
        for (let y = cy-1;y<=cy+1;y++) {
            // We don't want middle cell (this is cx and cy)
            if (x != 0 && y != 0) {
                //outside the map, so considers as a wall
                if (x != -1 && y != -1 && x != GRID_SIZE && y != GRID_SIZE)
                    res.push(grid[x][y]);
            }
        }
    }

    return res
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getRdmHeight() {

    return getRndInteger(range_height[0], range_height[1]);
}

function getRdm() {

    return getRndInteger(range_random[0], range_random[1]);
}

function roundHeight(height) {

    let res = Math.round(height);

    if (res < range_height[0])
        return range_height[0];

    if (res > range_height[1])
        return range_height[1];

    return res;
}

function debugGrid() {

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            print(grid[x][y]);
        }
    }
}

function calculateAverage(array) { 
    //return Math.round(array.reduce((sum, current) => sum + current) / array.length); 
    return (array.reduce((sum, current) => sum + current) / array.length); 
}

function displayDebug() {

    diameter = 20;

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            
            let posX = OFFSET_X + x * TILE_SIZE;
            let posY = OFFSET_Y + y * TILE_SIZE;

            fill('black');
            textSize(16);
            text("("+x+","+y+")", posX-diameter/2, posY - diameter);

            let c = (grid[x][y].height >= 0) ? color(0, 204, 0) : color(204, 0, 0);
            fill(c);
            circle(posX, posY, diameter);

            fill('black');
            textSize(16);
            text(grid[x][y].height, posX-diameter/2, posY + diameter*2);
        }
    }
}