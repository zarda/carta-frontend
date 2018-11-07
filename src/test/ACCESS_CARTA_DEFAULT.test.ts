import {CARTA} from "carta-protobuf";
import {
    stringToUint8Array, 
    getEventName
} from "./testUtilityFunction";

let WebSocket = require('ws');
let testServerUrl = "ws://localhost:50505";
let connectTimeoutLocal = 100;
let connectTimeoutRemote = 2000;
let testEventName = "REGISTER_VIEWER";
let testReturnName = "REGISTER_VIEWER_ACK"

describe("Websocket tests", () => {
    let testRemoteWebsocketSite = "wss://echo.websocket.org site";
    test(`establish a connection to ${testRemoteWebsocketSite}.`, 
    done => {
        // Construct a Websocket
        let Connection = new WebSocket("wss://echo.websocket.org");

        // While open a Websocket
        Connection.onopen = () => {
            Connection.close();
            done();     // Return to this test
        };
    }, connectTimeoutRemote);

    test(`establish a connection to ${testServerUrl}.`, 
    done => {
        // Construct a Websocket
        let Connection = new WebSocket(testServerUrl);

        // While open a Websocket
        Connection.onopen = () => {
            Connection.close();
            done();     // Return to this test
        };
    }, connectTimeoutLocal);
});

describe("ACCESS_CARTA_DEFAULT tests", () => {
    test(`send EventName: "${testEventName}" to CARTA ${testServerUrl} without session_id & api_key.`, 
    done => {
        // Construct a Websocket
        let Connection = new WebSocket(testServerUrl);
        Connection.binaryType = "arraybuffer";

        // While open a Websocket
        Connection.onopen = () => {
            
            // Checkout if Websocket server is ready
            if (Connection.readyState == WebSocket.OPEN) {
                // Preapare the message on a eventData
                const message = CARTA.RegisterViewer.create({sessionId: "", apiKey: ""});
                let payload = CARTA.RegisterViewer.encode(message).finish();
                let eventData = new Uint8Array(32 + 4 + payload.byteLength);

                eventData.set(stringToUint8Array(testEventName, 32));
                eventData.set(new Uint8Array(new Uint32Array([1]).buffer), 32);
                eventData.set(payload, 36);

                Connection.send(eventData);
            } else {
                console.log(`"${testEventName}" can not open a connection.`);
            }

        };

        // While receive a message in the form of arraybuffer
        Connection.onmessage = (event: MessageEvent) => {
            expect(event.data.byteLength).toBeGreaterThan(40);
            
            Connection.close();
            done();
        };

    }, connectTimeoutLocal);

    test(`send EventName: "${testEventName}" to CARTA "${testServerUrl}" with no session_id & api_key "1234".`, 
    done => {
        // Construct a Websocket
        let Connection = new WebSocket(testServerUrl);
        Connection.binaryType = "arraybuffer";

        // While open a Websocket
        Connection.onopen = () => {
            
            // Checkout if Websocket server is ready
            if (Connection.readyState == WebSocket.OPEN) {
                // Preapare the message on a eventData
                const message = CARTA.RegisterViewer.create({sessionId: "", apiKey: "1234"});
                let payload = CARTA.RegisterViewer.encode(message).finish();
                let eventData = new Uint8Array(32 + 4 + payload.byteLength);

                eventData.set(stringToUint8Array(testEventName, 32));
                eventData.set(new Uint8Array(new Uint32Array([1]).buffer), 32);
                eventData.set(payload, 36);

                Connection.send(eventData);
            } else {
                console.log(`"${testEventName}" can not open a connection.`);
            }

        };

        // While receive a message in the form of arraybuffer
        Connection.onmessage = (event: MessageEvent) => {
            expect(event.data.byteLength).toBeGreaterThan(40);

            Connection.close();
            done();
        };

    }, connectTimeoutLocal);

    describe(`receive EventName: "${testReturnName}" tests on CARTA ${testServerUrl}`, 
    () => {

        let Connection: WebSocket;
    
        beforeEach( done => {
            // Construct a Websocket
            Connection = new WebSocket(testServerUrl);
            Connection.binaryType = "arraybuffer";
    
            // While open a Websocket
            Connection.onopen = () => {
                
                // Checkout if Websocket server is ready
                if (Connection.readyState === WebSocket.OPEN) {
                    // Preapare the message on a eventData
                    const message = CARTA.RegisterViewer.create({sessionId: "", apiKey: "1234"});
                    let payload = CARTA.RegisterViewer.encode(message).finish();
                    let eventData = new Uint8Array(32 + 4 + payload.byteLength);
    
                    eventData.set(stringToUint8Array(testEventName, 32));
                    eventData.set(new Uint8Array(new Uint32Array([1]).buffer), 32);
                    eventData.set(payload, 36);
    
                    Connection.send(eventData);
                } else {
                    console.log(`"${testEventName}" can not open a connection.`);
                    Connection.close();
                }
                done();
            };
        }, connectTimeoutLocal);
    
        test(`assert the received EventName is "${testReturnName}" within ${connectTimeoutLocal * 1e-3} seconds.`, 
        done => {
            // While receive a message from Websocket server
            Connection.onmessage = (event: MessageEvent) => {
                expect(event.data.byteLength).toBeGreaterThan(40);
                
                const eventName = getEventName(new Uint8Array(event.data, 0, 32));
                expect(eventName).toBe(testReturnName);

                done();
                Connection.close();
            }
        }, connectTimeoutLocal);
    
        test(`assert the "${testReturnName}.session_id" is not None.`, 
        done => {
            // While receive a message from Websocket server
            Connection.onmessage = (event: MessageEvent) => {
                const eventName = getEventName(new Uint8Array(event.data, 0, 32));
                const eventId = new Uint32Array(event.data, 32, 1)[0];
                const eventData = new Uint8Array(event.data, 36);

                let parsedMessage;
                if (eventName === testReturnName) {
                    parsedMessage = CARTA.RegisterViewerAck.decode(eventData);
                }
                expect(parsedMessage.sessionId).toBeDefined();
                console.log(`current session ID is ${parsedMessage.sessionId}`);

                done();                
                Connection.close();
            }
    
        }, connectTimeoutLocal);
    
        test(`assert the "${testReturnName}.success" is true.`, 
        done => {
            // While receive a message from Websocket server
            Connection.onmessage = (event: MessageEvent) => {
                const eventData = new Uint8Array(event.data, 36);
                expect(CARTA.RegisterViewerAck.decode(eventData).success).toBe(true);
                done();
                
                Connection.close();
            }
        }, connectTimeoutLocal);
    
        test(`assert the "${testReturnName}.session_type" is "CARTA.SessionType.NEW".`, 
        done => {
            // While receive a message from Websocket server
            Connection.onmessage = (event: MessageEvent) => {
                const eventData = new Uint8Array(event.data, 36);
                expect(CARTA.RegisterViewerAck.decode(eventData).sessionType).toBe(CARTA.SessionType.NEW);
                done();
                    
                Connection.close();
            }
        }, connectTimeoutLocal);
    
    });
});