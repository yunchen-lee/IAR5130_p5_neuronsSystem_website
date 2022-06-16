let scene;
let mouseDragging = false;

// -------------------
// /* MQTT */
// MQTT broker setting
let broker = {
    hostname: 'public.cloud.shiftr.io',
    port: 443
};

// MQTT client:
let client;

let creds = {
    clientID: 'p5Client', // client id
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


function setup() {
    createCanvas(windowWidth, windowHeight);

    // create scene
    scene = new MapScene({});
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



}

function draw() {
    background(0);
    // background(255);

    push();
    fill(255);
    noStroke();
    textSize(32);
    text('Map', 30, 60);
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
        }
    })
    mouseDragging = true;
}


// ------------------------------
// /* MQTT Standard*/
// called when the client connects
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