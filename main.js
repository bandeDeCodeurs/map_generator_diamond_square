function setup() {

    SIZE = 8; // !!! Should not exceed 8
    GRID_SIZE = 2**SIZE + 1; // Final size map
    TILE_SIZE = 3;
    OFFSET_X = 40;
    OFFSET_Y = 40;
    INTERACTIVE_MODE = false; //If true, can see steps hitting RIGHT_ARROW
    SHRINK_COEFF_RANDOM = .42;
    FIX_HEIGHT_ALONE_POINT = 8; //cell surrounded by X different heights will be one of them
    RANGE_HEIGHT = [1, 16];
    RANGE_RANDOM = [-4, 4];

    grid = [];
    current_range_random = [...RANGE_RANDOM];
    step = 1;
    tmp_size = GRID_SIZE; // for interactive mode
    color_map = new ColorMap();
    display_borders = true;

    let cvn = createCanvas(GRID_SIZE*TILE_SIZE, GRID_SIZE*TILE_SIZE);
    cvn.id('map');
    cvn.parent("left");

    initGrid();

    if (!INTERACTIVE_MODE) {
        calculateHeights(GRID_SIZE);
        fixHeightAlonePoints(FIX_HEIGHT_ALONE_POINT);
        drawHeightMap();
        generateBorders();
        color_map.setLegend(GRID_SIZE*GRID_SIZE);
    }
}

function draw() {

}

function calculateHeights(size) {

    for (let x=0;x<2**(step-1);x++){
        for (let y=0;y<2**(step-1);y++){
            squareStep(x * (size - 1), y * (size - 1), size);
            diamondStep(x * (size - 1), y * (size - 1), size);
        }
    }

    step++;
    shrinkRangeRandom();

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

    if (keyCode === RETURN) {

        let timeStamp = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + nf(millis(), 3, 0);

        save(timeStamp + '.png');
    }

    if (keyCode === SHIFT) {

        step = 1;
        current_range_random = [...RANGE_RANDOM];
        color_map = new ColorMap();

        initGrid();
        calculateHeights(GRID_SIZE);
        fixHeightAlonePoints(FIX_HEIGHT_ALONE_POINT);
        drawHeightMap();
        generateBorders();
        color_map.setLegend(GRID_SIZE*GRID_SIZE);
    }

    //b key
    if (keyCode === 66) {

        display_borders = !display_borders;
        drawHeightMap();
        generateBorders();
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

function squareStep(topX, topY, size) {

    let rd = getRdm();
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

function diamondStep(topX, topY, size,) {

    let tl = grid[topX][topY].height; //top left
    let tr = grid[topX + size-1][topY].height; //top right
    let br = grid[topX + size-1][topY + size - 1].height; //bottom right
    let bl = grid[topX][topY + size - 1].height; // bottom left
    let center = grid[(size - 1) / 2 + topX][(size - 1) / 2 + topY].height //center

    //top
    let rd = getRdm();
    grid[(size - 1) / 2 + topX][topY].height = calculateAverage([tl,tr,center]) + rd;
    //right
    rd = getRdm();
    grid[topX + size-1][(size - 1) / 2 + topY].height = calculateAverage([tr,br,center]) + rd;
    //bottom
    rd = getRdm();
    grid[(size - 1) / 2 + topX][size - 1 + topY].height = calculateAverage([br,bl,center]) + rd;
    //left
    rd = getRdm();
    grid[topX][(size - 1) / 2 + topY].height = calculateAverage([bl,tl,center]) + rd;
}

function shrinkRangeRandom() {

    current_range_random[0] = current_range_random[0] * SHRINK_COEFF_RANDOM;
    current_range_random[1] = current_range_random[1] * SHRINK_COEFF_RANDOM;
}

function drawHeightMap() {

    noStroke();
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            
            let height = roundHeight(grid[x][y].height)
            let col = color(color_map.getHeightColor(height));
            fill(col);
            rect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function fillStats(height) {

    stats[height]
}

function generateBorders() {

    for (let cx=0;cx<GRID_SIZE;cx++) {
        for (let cy=0;cy<GRID_SIZE;cy++) {
        
        let height = roundHeight(grid[cx][cy].height);

            //we take four neigbours
            north = {dir:"north", x:cx, y:cy-1};
            east  = {dir:"east", x:cx+1, y:cy};
            south = {dir:"south", x:cx, y:cy+1};
            west  = {dir:"west", x:cx-1, y:cy};

            neighbours = [north, east, south, west];

            neighbours.forEach(n => {
                
                //we only want a neighbour in the map and we don't want to border water
                if (n.x != -1 && 
                    n.y != -1 && 
                    n.x != GRID_SIZE && 
                    n.y != GRID_SIZE && 
                    roundHeight(grid[n.x][n.y].height) == height - 1 &&
                    roundHeight(grid[n.x][n.y].height) >= 5
                    ) {
                        let c;
                        if (display_borders)
                            c = ColorLuminance(color_map.getHeightColor(height),-.2)
                        else
                            c = color_map.getHeightColor(height);

                    traceBorder(cx, cy, n.dir, c);
                }
            });
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

    return getRndInteger(RANGE_HEIGHT[0], RANGE_HEIGHT[1]);
}

function getRdm() {

    return getRndInteger(current_range_random[0], current_range_random[1]);
}

function roundHeight(height) {

    let res = Math.round(height);

    if (res < RANGE_HEIGHT[0])
        return RANGE_HEIGHT[0];

    if (res > RANGE_HEIGHT[1])
        return RANGE_HEIGHT[1];

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

function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  }