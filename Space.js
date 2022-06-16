class Space {
    constructor(args) {
        this.p = args.p || createVector(width / 2, height / 2);
        this.r = args.r || 50;
        this.centerDia = 25;
        this.id = args.id;
        this.linkList = [];
        this.weightList = [];
        this.active = 255;
        this.flash = 255;
        this.pretime;
        this.wMax = 800;
        this.targetR;
        this.targetRMin = 70;
        this.mapchar = args.mapchar;
    }

    run() {
        let currentTime = int(millis() / 10);
        if (this.pretime != currentTime) {
            this.pretime = currentTime;
            this.active -= 1;
            this.flash -= 20;

            if (this.active < 0) this.active = 0;
            if (this.active > 255) this.active = 255;
            if (this.flash < 0) this.flash = 0;
            if (this.flash > 255) this.flash = 255;
        }

    }


    draw(type) {
        push();

        if (type == "map") {
            noFill();
            stroke(this.flash + 100);
            strokeWeight(2);
            translate(this.p.x, this.p.y);
            rectMode(CENTER);
            // rect(0, 0, 20, 20);
        } else if (type == "network") {
            noFill();
            stroke(this.flash + 100);
            strokeWeight(2);
            translate(this.p.x, this.p.y);
            this.targetR = this.remap(this.linkList.length, 0, 8, this.targetRMin, 200);
            if (this.active < 10) this.targetR = this.targetRMin;
            this.r = lerp(this.r, this.targetR, 0.005);
            circle(0, 0, this.r * 2);
        }

        pop();
    }


    updateLinkList(msg) {
        //id,weight+id,weight+id,weight...
        //2,1.03+3,2.05+5,3.02...
        this.linkList = [];
        this.weightList = [];
        let pairs = msg.split("+");
        pairs.forEach(pair => {
            // let index = pair.split(",")[0].padStart(4, '0');
            let index = pair.split(",")[0];
            let value = pair.split(",")[1];
            this.linkList.push(index);
            this.weightList.push(value);
        })
        this.active = 255;
    }

    // =============================================================
    // /* remap */
    remap(val, sMin, sMax, tMin, tMax) {
        if (val < sMin) val = sMin;
        else if (val > sMax) val = sMax;
        return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
    }

    // =============================================================
    // -------------------------------------------------------------
    // /* circle packing */
    checkIntersec(pts) {
        let p2pts = createVector(this.p.x - pts.p.x, this.p.y - pts.p.y, this.p.z - pts.p.z);
        let distance = p2pts.mag();
        if (distance < this.r + pts.r) {
            let moveStep = -(distance - this.r - pts.r) / 7.0;
            p2pts.normalize();
            p2pts.mult(moveStep);
            this.p = createVector(this.p.x + p2pts.x, this.p.y + p2pts.y, this.p.z + p2pts.z)
        }
    }

    // /* if location inside node */
    ifInside(x, y) {
        let ifinside = false;
        let dis = dist(this.p.x, this.p.y, x, y);
        if (dis < this.r) ifinside = true;
        return ifinside;
    }

}