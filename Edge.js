class Edge {
    // =============================================================
    // /* constructor */
    constructor(args) {
        this.node1 = args.node1;
        this.node2 = args.node2;
        this.weight = args.weight || 300;
        this.wMax = args.wMax || 800; //[1, 1.5, 2, 2.5, 3, 3.5, 4, 8]
    }

    // -------------------------------------------------------------
    // /* run loop */
    run() {
        let len = this.node1.p.dist(this.node2.p);
        let minDist = this.node1.r * 2 + this.node2.r * 2;

        // if (len > minDist && frameCount < 30) {
        if (len > minDist) {

            let direct = createVector(this.node1.p.x - this.node2.p.x, this.node1.p.y - this.node2.p.y);
            direct = direct.mult(0.48)
            let negDirect = createVector(-direct.x, -direct.y);

            // this.drawArrow(this.node2.p, direct, "red");
            // this.drawArrow(this.node1.p, negDirect, "blue");

            this.node1.p = p5.Vector.add(this.node1.p, negDirect);
            this.node2.p = p5.Vector.add(this.node2.p, direct);

        }

    }


    // -------------------------------------------------------------
    // /* draw loop */
    draw() {
        push();
        let op = Math.min(this.remap(this.node1.active, 0, 255, 20, 80), this.remap(this.node2.active, 0, 255, 20, 80))
        fill(125, op);
        noStroke();
        let rad = 25 / 2;
        let cScale = this.remap(this.weight, 0, this.wMax, 0.1, 0.5); //0.5;
        let aeremap = this.remap(this.weight, 0, this.wMax, 0.2, 1);
        let bdremap = this.remap(this.weight, 0, this.wMax, 0, 0.8);
        let aeScale = rad * aeremap * aeremap;
        let bdScale = rad * bdremap * bdremap;
        let direct = createVector(this.node2.p.x - this.node1.p.x, this.node2.p.y - this.node1.p.y);
        let c = p5.Vector.add(this.node1.p, direct.copy().mult(cScale));
        let a = p5.Vector.add(this.node1.p, direct.copy().rotate(90).normalize().mult(aeScale));
        let e = p5.Vector.add(this.node1.p, direct.copy().rotate(-90).normalize().mult(aeScale));
        let d = p5.Vector.add(this.node2.p, direct.copy().rotate(-90).normalize().mult(bdScale));
        let b = p5.Vector.add(this.node2.p, direct.copy().rotate(90).normalize().mult(bdScale));

        beginShape();
        vertex(a.x, a.y);
        bezierVertex(a.x, a.y, c.x, c.y, b.x, b.y);
        vertex(b.x, b.y);
        vertex(d.x, d.y);
        bezierVertex(d.x, d.y, c.x, c.y, e.x, e.y);
        endShape();
        pop();
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
    // /* remap */
    remap(val, sMin, sMax, tMin, tMax) {
        if (val < sMin) val = sMin;
        else if (val > sMax) val = sMax;
        return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
    }
}