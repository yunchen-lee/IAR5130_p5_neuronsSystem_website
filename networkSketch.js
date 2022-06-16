let scene;
let mouseDragging = false;

//-------------------
/* MQTT */
// MQTT broker setting
let broker = {
    hostname: 'public.cloud.shiftr.io',
    port: 443
};

// MQTT client:
let client;

let creds = {
    clientID: 'p5Client2', // client id
    userName: 'public',
    password: 'public'
}

let subscribeTopics = ['HA/motherTree/server/0'];
let serverTopic = 'HA/motherTree/server/0';
let neurons_TopicHeader = "/Neuron/";
let neurons_broadcast = "/Neuron/broadcast";
let neurons_messageSend = "/Neuron/messageSend";

// millis setting
let currentTime;
let preTime = 0;
let timePeriod = 1000; //ms

//----------------------------------------------
let btnHello, btnChooseNeuron;
let inputChangeColor;


// ============================================


function setup() {
    createCanvas(windowWidth, windowHeight);

    // create scene
    scene = new NetworkScene({});
    scene.setup()

    // mode
    angleMode(DEGREES);
    colorMode(HSB, 255);

    // MQTT --------------------------
    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker.hostname, broker.port, creds.clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect to the MQTT broker:
    client.connect({
        onSuccess: onConnect, // callback function for when you connect
        userName: creds.userName, // username
        password: creds.password, // password
        //useSSL: true // use SSL
        useSSL: true
    });

    // ----------------------------------
    btnHello = createBtn("Hi, Neuron", createVector(30, 120), sendHi2Neuron);
    btnChooseNeuron = createBtn("Link to Neuron", createVector(30, 155), Link2Neuron);
    inputChangeColor = createInputBtn("send", createVector(30, 230), senchangeClr);
}

function draw() {
    background(0);

    push();
    fill(255);
    noStroke();
    textSize(32);
    text('Net', 30, 60);
    textSize(12);
    text("clink to pick a neuron!", 30, 100);
    push();
    stroke(100);
    noFill();
    line(160, 97, 700, 97);
    pop();
    textSize(15);
    text("No. " + str(scene.currentPick), 120, 137);
    text("No. " + str(scene.currentPick), 144, 173);
    push();
    stroke(100);
    noFill();
    line(30, 200, 200, 200);
    pop();
    text("message to No. " + str(scene.messageTarget), 30, 220);
    pop();

    mouseDragging = false;


    scene.run();
    scene.draw();
}

// ===============================================
// -------------------
// /* MOUSE EVENT */
function mouseDragged() {
    scene.nodes.forEach(n => {
        if (n.ifInside(mouseX, mouseY)) {
            n.setPosition(mouseX, mouseY);
            scene.currentPick = n.id;
        }
    })
    mouseDragging = true;
}

function mouseClicked() {
    scene.nodes.forEach(n => {
        if (n.ifInside(mouseX, mouseY)) {
            n.setPosition(mouseX, mouseY);
            scene.currentPick = n.id;
        }
    })
}


function mousePressed() {
    scene.nodes.forEach(n => {
        if (n.ifInside(mouseX, mouseY)) {
            n.setPosition(mouseX, mouseY);
            scene.currentPick = n.id;
        }
    })
}



//------------------------------
/* MQTT Standard*/
//called when the client connects
function onConnect() {
    console.log('client is connected');
    subscribeTopics.forEach(topic => {
        client.subscribe(topic)
        console.log("done subscribe: " + topic);
    });
}

// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) console.log('onConnectionLost:' + response.errorMessage);
}

// called when a message arrives
function onMessageArrived(message) {
    //console.log('message arrived from topic[' + message.destinationName + "]: " + message.payloadString);

    // scene check if need to add a new node
    if (message.destinationName == serverTopic) {
        let topicArr = message.payloadString.split("/");
        let index = topicArr.pop();
        if (int(index) >= 10) scene.createSpace(index);
        else scene.addNode(message.payloadString);
        subNewTopic(message.payloadString);
    }
    if (message.destinationName.includes(neurons_TopicHeader)) {
        let index = message.destinationName.split("/").pop();
        if (message.payloadString == '0') {
            if (int(index) >= 10) { scene.update_SpacesBroadcast(index) } else { scene.update_NodesBroadcast(index); }
        } else {
            if (int(index) >= 10) {
                scene.update_SpacesLinklist(index, message.payloadString);
            } else scene.update_NodesLinklist(index, message.payloadString);
        }
        if (message.destinationName.includes(neurons_messageSend)) {
            let msgSourceIdx = message.payloadString.split("`").shift();
            let msg = message.payloadString.split("`").pop();
            console.log(msg);
            if (msgSourceIdx == index && msg == "helloNeuron") {
                scene.letNodeSayHi(msgSourceIdx);
            }
            if (msg.includes("changeHue")) {
                let newHue = msg.split("-").pop();
                scene.letNodeChangeHue(index, newHue);
            }
        }

        if (index == scene.messageTarget) {
            scene.updateMsglist('message arrived from topic[' + message.destinationName + "]: " + message.payloadString);
        }
    }

}

// called when you want to send a message:
function sendMqttMessage(msg, topic) {
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {
        // start an MQTT message:
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        client.send(message);
        console.log('message send to topic[' + topic + "]: " + message.payloadString);
    }
}


// ------------------------------
// /* MQTT Addition */
// subscribe new topic by ID of new addded node
function subNewTopic(topic) {
    client.subscribe(topic)
}


// ------------------------------
// /* btn */
function createBtn(name, pos, callback) {
    let btn = createButton(name);
    btn.position(pos.x, pos.y);
    btn.mousePressed(callback);
    return btn;
}

function createInputBtn(name, pos, callback) {
    let input = createInput();
    input.position(pos.x, pos.y);
    input.size(100);
    let btn = createBtn(name, createVector(pos.x + input.width, pos.y), callback);
    return [input, btn];
}

//
function sendHi2Neuron() {
    if (scene.currentPick != "x") {
        sendMqttMessage(scene.currentPick + "`helloNeuron", "HA" + neurons_messageSend + "/" + scene.currentPick);
    }

}

function Link2Neuron() {
    scene.messageTarget = scene.currentPick;
}

function senchangeClr() {
    let huev = inputChangeColor[0].value();
    huev = int(remap(int(huev), 0, 360, 0, 255));
    if (scene.messageTarget != "x") {
        sendMqttMessage(scene.messageTarget + "`changeHue-" + str(huev), "HA" + neurons_messageSend + "/" + scene.messageTarget);
    }
}

// =============================================================
// /* remap */
function remap(val, sMin, sMax, tMin, tMax) {
    if (val < sMin) val = sMin;
    else if (val > sMax) val = sMax;
    return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
}