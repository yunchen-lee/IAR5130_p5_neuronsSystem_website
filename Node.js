class Node {
    // =============================================================
    // /* constructor */
    constructor(args) {
        this.p = args.p || createVector(width / 2, height / 2);
        this.r = args.r || 20;
        this.netR = 40;

        this.packingR;

        this.innerR = 25;
        this.id = args.id;
        this.linkList = [];
        this.weightList = [];
        this.active = 255;
        this.pretime;

        // color 
        this.hueValue = 360;
        this.saturation = 0;
        this.flash = 255;

        this.hello = false;
        this.changeHue = false;
    }

    // -------------------------------------------------------------
    // /* draw loop */
    draw(type) {

        // draw node
        push();
        translate(this.p.x, this.p.y);
        // fill(this.hueValue, this.saturation, this.flash);
        if (this.hello) {
            this.hueValue += 5;
            fill(this.hueValue, this.saturation, 255);
            if (this.hueValue > 360) {
                this.hueValue = 360;
                this.hello = false;
                this.saturation = 0;
            }
        } else if (this.changeHue) {
            fill(this.hueValue, this.saturation, this.flash);
            this.saturation -= 0.2;
            if (this.saturation < 0) {
                this.saturation = 0;
                this.changeHue = false;
                this.hueValue = 360;
            }
        } else fill(this.hueValue, this.saturation, this.flash);
        stroke(100);
        strokeWeight(1.5);
        circle(0, 0, this.innerR);

        if (type == "network") {
            //draw circle
            // stroke(70);
            // noFill();
            // circle(0, 0, this.netR * 2);
            this.packingR = this.netR;
        } else {
            this.packingR = this.r;
        }

        // draw text of index
        textSize(10);
        noStroke()
        fill(180);
        textAlign(CENTER, CENTER);
        text(this.id, 0, -this.innerR * 0.8);
        pop();
    }

    // -------------------------------------------------------------
    // /* run loop */
    run() {

        // let currentTime = int(millis() / 100);
        // if (this.pretime != currentTime) {
        //     this.pretime = currentTime;
        //     this.active--;
        //     this.flash -= 40;

        //     if (this.active < 0) this.active = 0;
        //     if (this.active > 255) this.active = 255;
        //     if (this.flash < 0) this.flash = 0;
        //     if (this.flash > 255) this.flash = 255;
        // }

        let currentTime = int(millis() / 10);
        if (this.pretime != currentTime) {
            this.pretime = currentTime;
            this.active -= 0.1;
            this.flash -= 20;

            if (this.active < 0) this.active = 0;
            if (this.active > 255) this.active = 255;
            if (this.flash < 0) this.flash = 0;
            if (this.flash > 255) this.flash = 255;
        }


    }

    // =============================================================
    // -------------------------------------------------------------
    // /* circle packing */
    checkIntersec(pts) {
        let p2pts = createVector(this.p.x - pts.p.x, this.p.y - pts.p.y, this.p.z - pts.p.z);
        let distance = p2pts.mag();
        if (distance < this.packingR + pts.packingR) {
            let moveStep = -(distance - this.packingR - pts.packingR) / 7.0;
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

    // =============================================================
    // /* mouse drag */
    setPosition(mousex, mousey) {
        this.p.x = mousex;
        this.p.y = mousey;
    }

    updateLinkList(msg) {
        //id,weight+id,weight+id,weight...
        //2,1.03+3,2.05+5,3.02...
        this.linkList = [];
        this.weightList = [];
        let pairs = msg.split("+");
        pairs.forEach(pair => {
            //let index = pair.split(",")[0].padStart(4, '0');
            let index = pair.split(",")[0];
            let value = pair.split(",")[1];
            this.linkList.push(index);
            this.weightList.push(value);
        })

        this.active = 255;
    }

}