class Grid {
    // =============================================================
    // /* constructor */
    constructor(args) {
        this.p = args.p;
        this.r = args.r;
        this.pid = args.pid;
        this.wallType = args.wallType || ["empty", "dot", "col", "row", "rd-corner", "rt-corner", "ld-corner", "lt-corner", "u-tupe", "d-tupe", "l-tupe", "r-tupe", "u-end", "d-end", "r-end", "l-end"];
        this.colorPattern = ["fcba03", "03b1fc", "a103fc", "fa3a05", "d9fa05"].map(s => "#" + s);
    }

    // -------------------------------------------------------------
    // /* draw loop */
    draw(op) {
        push();
        translate(this.p.x, this.p.y);
        rectMode(CENTER);
        stroke(120);
        // stroke(0);
        noFill();
        // rect(0, 0, this.r);

        let r = this.r;
        let span = this.r / 2 * 0.8;
        let hSpan = this.r / 2 * 0.3;
        stroke(100);
        if (this.wallType == "dot") circle(0, 0, span);
        else if (this.wallType == "col") {
            line(-hSpan, -r / 2, -hSpan, r / 2);
            line(hSpan, -r / 2, hSpan, r / 2);
        } else if (this.wallType == "row") {
            line(-r / 2, -hSpan, r / 2, -hSpan);
            line(-r / 2, hSpan, r / 2, hSpan);
        } else if (this.wallType.includes("corner")) {
            push();
            if (this.wallType == "rd-corner") {
                translate(-r / 2, -r / 2);
            } else if (this.wallType == "rt-corner") {
                translate(-r / 2, r / 2);
                rotate(-90);
            } else if (this.wallType == "ld-corner") {
                translate(r / 2, -r / 2);
                rotate(90);
            } else if (this.wallType == "lt-corner") {
                translate(r / 2, r / 2);
                rotate(180);
            }
            arc(0, 0, r - hSpan * 2, r - hSpan * 2, 0, 90);
            arc(0, 0, r + hSpan * 2, r + hSpan * 2, 0, 90);
            pop();
        } else if (this.wallType.includes("tupe")) {
            if (this.wallType == "d-tupe") rotate(180);
            else if (this.wallType == "r-tupe") rotate(90);
            else if (this.wallType == "l-tupe") rotate(-90);

            push();
            push();
            translate(-r / 2, -r / 2);
            arc(0, 0, r - hSpan * 2, r - hSpan * 2, 0, 90)
            pop();
            push();
            translate(r / 2, -r / 2);
            arc(0, 0, r - hSpan * 2, r - hSpan * 2, 90, 180)
            pop();
            line(-r / 2, hSpan, r / 2, hSpan);
            pop();
        } else if (this.wallType.includes("end")) {
            push();
            if (this.wallType == "r-end") rotate(-90)
            else if (this.wallType == "l-end") rotate(90)
            else if (this.wallType == "u-end") rotate(180)
            arc(0, 0, hSpan * 2, hSpan * 2, 180, 0);
            line(-hSpan, 0, -hSpan, r / 2);
            line(hSpan, 0, hSpan, r / 2);
            pop();
        } else {
            if (this.wallType != "-") {
                push();
                noStroke();
                // let c = color(this.colorPattern[int(this.wallType - 1) % this.colorPattern.length]);
                let c = color(0, 0, 100);
                op = this.remap(op, 0, 255, 35, 90);
                c.setAlpha(op);
                fill(c);
                rect(0, 0, this.r * 0.9, this.r * 0.9, hSpan)
                fill(180);
                textAlign(CENTER, CENTER);
                // text(this.wallType, 0, 0);
                pop();
            }
        }

        // push();
        // textAlign(CENTER, CENTER);
        // fill(180);
        // noStroke();
        // textSize(8);
        // text(str(this.pid.x) + "/" + str(this.pid.y), 0, 0);
        // pop();


        pop();
    }

    // -------------------------------------------------------------
    // /* check if location inside grid */
    checkInside(pos) {
        let isInside = false;
        let minx = this.p.x - this.r / 2;
        let maxx = this.p.x + this.r / 2;
        let miny = this.p.y - this.r / 2;
        let maxy = this.p.y + this.r / 2;
        if (pos.x > minx && pos.x < maxx && pos.y > miny && pos.y < maxy) isInside = true;
        return isInside;
    }

    // =============================================================
    // /* remap */
    remap(val, sMin, sMax, tMin, tMax) {
        if (val < sMin) val = sMin;
        else if (val > sMax) val = sMax;
        return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
    }

}