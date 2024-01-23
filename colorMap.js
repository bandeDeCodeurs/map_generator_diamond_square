class ColorMap {

    constructor() {

        this.data = {

            1:{"color":"#052F66","name":"abyss","count":0},               // abyss
            2:{"color":"#004AAD","name":"deep sea","count":0},            // deep sea
            3:{"color":"#38B6FF","name":"sea","count":0},                 // sea
            4:{"color":"#0CC0DF","name":"lagoon","count":0},              // lagoon
            5:{"color":"#5CE1E6","name":"transparent water","count":0},   // transparent water
            6:{"color":"#FFDE59","name":"beach","count":0},               // beach
            7:{"color":"#FFBD59","name":"sand/land","count":0},           // sand/land
            8:{"color":"#C28221","name":"land","count":0},                // land
            9:{"color":"#96651B","name":"mud","count":0},                 // mud
            10:{"color":"#7ED957","name":"light grass","count":0},        // light grass
            11:{"color":"#05AD5C","name":"grass","count":0},              // grass
            12:{"color":"#545454","name":"dark rock","count":0},          // dark rock
            13:{"color":"#737373","name":"grey rock","count":0},          // grey rock
            14:{"color":"#A6A6A6","name":"light grey rock","count":0},    // light grey rock
            15:{"color":"#D9D9D9","name":"very light grey rock","count":0},// very light grey rock
            16:{"color":"#FFFFFF","name":"snow","count":0}                // snow
        }
    }

    getHeightColor(height) {

        //we increase the counter ;)
        this.data[height].count ++;

        return this.data[height].color;
    }

    setLegend(sizeGrid) {

        let tmp_array = Object.values(this.data);
        let sorted_data = tmp_array.sort(function(a,b){

            return b.count - a.count;
        })

        let html = "";

        tmp_array.forEach(el => {

            let perc = Math.round(el.count/sizeGrid*100);

            if (perc > 0) {
                html += "<div class='line-legend'>\n";
                html += "<div style='background:" + el.color + ";' class='legend-color'></div>";
                html += "<div class='legend-name'>" + el.name.charAt(0).toUpperCase() + el.name.slice(1) + "</div>";
                html += "<div class='legend-percent'>(" + perc + "%)</div>";
                html += "</div>\n";
            }
        });

        document.getElementById("legend").replaceChildren();
        document.getElementById("legend").innerHTML = html;
    }
}