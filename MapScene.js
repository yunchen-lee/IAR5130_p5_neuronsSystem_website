class MapScene {
    // =============================================================
    // /* constructor */
    constructor(args) {
        this.mapCenter = args.mapCenter || createVector(width / 2, height / 2);
        this.map = [];
        //     this.mapSetting =
        //    `--oooooo------------
        //     --o3333o------------
        //     --o3333o------------
        //     --o3333o------------
        //     --o3333o---oooooooo-
        //     -ooooo-ooooo222222o-
        //     -o444o-----o222222o-
        //     -o444------o222222o-
        //     -o444o-----o222222o-
        //     -o444o-----oo-ooooo-
        //     -o444o----------o---
        //     oooooooo--------o---
        //     o555555---------o---
        //     o555555oooo-ooo-oooo
        //     o555555o------o1111o
        //     o555555o------o1111o
        //     o555555o------o1111o
        //     o555555o------o1111o
        //     o555555o------oooooo
        //     oooooooo------------
        //     `;
        this.mapSetting =
            `oooooooooooooooooooooooooooooooooooooooo
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------o22222222222222222o--------
            -------------oo--ooooooooooo--ooo--ooooo
            -------------o-----------------------o--
            -------------o-----------------------o--
            -------------o-----------------------o--
            -------------o-----------------------o--
            -------------o-----------------------o--
            -------------o-----------------------o--
            -------------o-----------------------o--
            -------------o-----------------------o--
            oooo---------------------------------o--
            ---o---------------------------------o--
            ---o---------------------------------o--
            ---o---------------------------------o--
            ---o---------oooo--------------------o--
            ---o------------o------ooooooooo-----o--
            ---o------------oooooooo-------o-----o--
            ---o---------o--o111111o-------------o--
            ---o---------o111111111o-------------o--
            ---o---------o111111111o-------o-----o--
            ---o---------o111111111o-------o-----o--
            ---ooooooooooo111111111o-------o-----o--
            -------------o111111111o-------o-----o--
            -------------o111111111o-------o-----o--
            -------------o111111111o-------o-----o--
            -------------o111111111ooooooooo-----o--
            -------------o111111111o-------------o--
            -------------o111111111o-------------o--
            -------------o111111111o-------------o--
            -------------o111111111o-------------o--
            -------------ooooooooooooooooooooooooooo
            `;
        this.mapArr;
        // this.mapSize = 20;
        this.mapSize = 40;

        //--------------------------------
        this.nodes = [];
        this.edges = [];
        this.spaces = [];

    }

    // -------------------------------------------------------------
    // /* set up */
    setup() {
        // let gridsize = 30;
        let gridsize = 15;

        this.initMap(this.mapSize, this.mapSize, gridsize);
        let gridWidth = this.mapSize * gridsize;
        let gridHeight = this.mapSize * gridsize;
        // let p = new Player({
        //     pid: createVector(int(this.mapSize / 2), int(this.mapSize / 2)),
        //     name: "yclee",
        //     r: 20,
        //     mapOrigin: createVector(this.mapCenter.x - gridWidth / 2, this.mapCenter.y - gridHeight / 2)
        // })
        // p.setup();
        // this.players.push(p);
    }

    // init map //------
    initMap(rownum, colnum, size) {

        this.mapArr = this.mapSetting.split("\n");
        this.mapArr = this.mapArr.map(s => s.replace(/(^[\s]*)|([\s]*$)/g, ""));

        let gridWidth = rownum * size;
        let gridHeight = colnum * size;
        let origin = createVector(this.mapCenter.x - gridWidth / 2, this.mapCenter.y - gridHeight / 2);
        for (let j = 0; j < colnum; j++) {
            for (let i = 0; i < rownum; i++) {
                let g = new Grid({
                    p: createVector(origin.x + i * size, origin.y + j * size),
                    r: size,
                    pid: createVector(i, j),
                    wallType: this.checkGridType(i, j)
                })
                this.map.push(g);
            }
        }
    }

    // -------------------------------------------------------------
    // /* run loop */
    run() {
        // circle packing
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes.length; j++) {
                if (i == j) continue;
                else {
                    this.nodes[i].checkIntersec(this.nodes[j]);
                }
            }
        }

        this.nodes.forEach(n => {
            n.run();
        })

        this.spaces.forEach(s => { s.run(); })
        this.updateLocation();

    }

    // -------------------------------------------------------------
    // /* draw loop */
    draw() {
        this.drawMap();

        this.spaces.filter(s => { return s.active > 0; }).forEach(s => { s.draw("map"); });

        // draw edges
        // this.edges.forEach(eg => {
        //     eg.draw();
        // })

        // draw nodes 
        this.nodes.filter(n => { return n.active > 0; }).forEach(n => { n.draw("map"); });

        push();
        fill(190);
        noStroke();
        textSize(15);
        text("HA105", 460, 87);
        text("HA101", 345, 462);
        pop();

    }

    // draw map //------
    drawMap() {
        let op;
        this.map.forEach(g => {
            op = 0;
            if (g.wallType.match(/[1-9]/g)) {
                this.spaces.forEach(s => {
                    if (s.mapchar == g.wallType) {
                        //console.log(g.wallType);
                        op = s.flash;
                    }
                })
            }
            g.draw(op);
        })
    }

    // -------------------------------------------------------------
    // /* check grid */
    checkGridType(i, j) {
        let type = this.getGridInMap(i, j);

        if (this.isWall(i, j)) {
            let l = this.isWall(i - 1, j);
            let r = this.isWall(i + 1, j);
            let u = this.isWall(i, j - 1);
            let d = this.isWall(i, j + 1);

            if (!u && !d && !l && !r) type = "dot";
            else if (u && d && !l && !r) type = "col";
            else if (!u && !d && l && r) type = "row";
            else if (u && r && !d && !l) type = "ld-corner";
            else if (u && l && !d && !r) type = "rd-corner";
            else if (d && r && !u && !l) type = "lt-corner";
            else if (d && l && !u && !r) type = "rt-corner";
            else if (u && r && l && !d) type = "u-tupe";
            else if (d && l && r && !u) type = "d-tupe";
            else if (l && u && d && !r) type = "l-tupe";
            else if (r && u && d && !l) type = "r-tupe";
            else if (!r && u && !d && !l) type = "u-end";
            else if (!r && !u && d && !l) type = "d-end";
            else if (r && !u && !d && !l) type = "r-end";
            else if (!r && !u && !d && l) type = "l-end";
        }
        return type;
    }

    // get grid's char //------
    getGridInMap(i, j) {
        let result = null;
        if (i >= 0 && i < this.mapSize && j >= 0 && j < this.mapSize) {
            result = this.mapArr[j][i];
        }
        return result;
    }

    // check if grid is wall //------
    isWall(i, j) {
        let iswall = false;
        if (this.getGridInMap(i, j) == 'o') iswall = true;
        return iswall;
    }

    // =============================================================
    // -------------------------------------------------------------
    // /* add new node */
    addNode(topic) {

        let topicArr = topic.split("/");
        let _id = topicArr.pop();

        let notExisted = true;
        this.nodes.forEach(n => {
            if (n.id == _id) notExisted = false;
        })
        if (notExisted) {
            let newNode = new Node({
                p: createVector(width / 2 + random(-100, 100), height / 2 + random(-100, 100)),
                id: _id,
                active: 255
            })
            this.nodes.push(newNode);
        }
    }

    createSpace(idstr) {
        let notExisted = true;
        this.spaces.forEach(s => {
            if (s.id == idstr) notExisted = false;
        })
        if (notExisted) {
            let newSpace = new Space({
                p: this.getSpacePosition_mapChar(idstr)[0],
                id: idstr,
                mapchar: this.getSpacePosition_mapChar(idstr)[1]
            })
            this.spaces.push(newSpace);
        }
        // console.log(this.spaces);
        // this.getSpacePosition(idstr);
    }

    getSpacePosition_mapChar(id) {
        let pos = [
            [10, createVector(24, 5), "2"], //device id/pos/map char
            [11, createVector(18, 33), "1"]
        ];

        // console.log(pos[0][1]);
        let spaceLocation;
        let mapchar;

        pos.forEach(p => {
            if (p[0] == int(id)) {
                //spaceLocation = createVector(p[1].x, p[1].y);
                this.map.forEach(m => {
                    if (m.pid.x == p[1].x && m.pid.y == p[1].y) {
                        spaceLocation = createVector(m.p.x, m.p.y);
                        mapchar = p[2];
                    }
                })
            }
        })

        let result = [];
        result.push(spaceLocation);
        result.push(mapchar)
        return result;

    }

    // =============================================================
    // -------------------------------------------------------------
    // /* update nodes linklist */
    update_NodesLinklist(idstr, msg) {
        this.nodes.forEach(n => {
            if (n.id == idstr) {
                n.updateLinkList(msg);
                //console.log(n);
            }
        })
        this.updateEdges(idstr)

    }

    update_SpacesLinklist(idstr, msg) {
        this.spaces.forEach(s => {
            if (s.id == idstr) {
                s.updateLinkList(msg);
                // console.log(s);
            }
        });
        //this.updateLocation();
    }



    updateEdges(idstr) {
        for (let i = this.edges.length - 1; i >= 0; i--) {
            if (this.edges[i].node1.id == idstr) {
                this.edges.splice(i, 1);
            }
        }
        //console.log(this.edges);

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id == idstr) {
                //console.log(this.nodes[i].linkList);
                for (let j = 0; j < this.nodes[i].linkList.length; j++) {
                    //idstr = idstr.replace(/(^[0]*)/g, "");
                    for (let k = 0; k < this.nodes.length; k++) {
                        if (this.nodes[k].id == this.nodes[i].linkList[j]) {
                            this.addOneEdge(i, k, this.nodes[i].weightList[j]);
                        }
                    }
                }
            }
        }
        //console.log(this.edges);

    }

    addOneEdge(idx1, idx2, w) {
        let eg = new Edge({
            node1: this.nodes[idx1],
            node2: this.nodes[idx2],
            weight: w
        })
        this.edges.push(eg);
        //console.log(this.edges);
    }

    // =============================================================
    // -------------------------------------------------------------
    // /* update nodes broadcast */
    update_NodesBroadcast(idstr) {
        this.nodes.forEach(n => {
            if (n.id == idstr) {
                n.flash = 255;
                n.active = 255;
            }
        })
    }

    update_SpacesBroadcast(idstr) {
        this.spaces.forEach(s => {
            if (s.id == idstr) {
                s.flash = 255;
                s.active = 255;
            }
        })
    }



    // =============================================================
    // -------------------------------------------------------------
    // /* moving to room */
    updateLocation() {
        this.spaces.forEach(s => {
            if (s.active > 10) {
                //console.log(s.p)
                // s.linkList.forEach(ml => {
                for (let i = 0; i < s.linkList.length; i++) {
                    this.nodes.forEach(n => {
                            // console.log(ml)
                            if (s.linkList[i] == n.id) {
                                // console.log("move")
                                // let rndp = createVector(s.p.x + random(-10, 10), s.p.y + random(-10, 10));
                                let scale = this.remap(s.weightList[i], 0, s.wMax, 0, 0.1);
                                // let direct = createVector(rndp.x - n.p.x, rndp.y - n.p.y);
                                let direct = createVector(s.p.x - n.p.x, s.p.y - n.p.y);
                                //this.drawArrow(n.p, direct, "red");
                                n.p = p5.Vector.add(n.p, direct.copy().mult(scale * scale));
                            }
                        })
                        // })
                }
            }

        })


    }

    // =============================================================
    // -------------------------------------------------------------
    // /* get grid color by spaces' flash value */
    getSpaceFlash() {

    }

    // =============================================================
    // /* remap */
    remap(val, sMin, sMax, tMin, tMax) {
        if (val < sMin) val = sMin;
        else if (val > sMax) val = sMax;
        return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
    }


    drawArrow(base, vec, myColor) {
        push();
        stroke(myColor);
        strokeWeight(3);
        fill(myColor);
        translate(base.x, base.y);
        line(0, 0, vec.x, vec.y);
        rotate(vec.heading());
        let arrowSize = 7;
        translate(vec.mag() - arrowSize, 0);
        triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        pop();
    }


    // =============================================================
    // -------------------------------------------------------------
    // /* light up by msg */
    letNodeSayHi(idstr) {
        this.nodes.forEach(n => {
            if (n.id == idstr) {
                n.hueValue = 0;
                n.saturation = 255;
                n.hello = true;
            }
        })

    }

    letNodeChangeHue(idstr, hstr) {
        this.nodes.forEach(n => {
            if (n.id == idstr) {
                n.hueValue = int(hstr);
                n.saturation = 255;
                n.changeHue = true;
            }
        })
    }

}