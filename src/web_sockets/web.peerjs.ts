import { INestApplication } from "@nestjs/common";
import { ExpressPeerServer } from "peer";

export function peerConnection(app: INestApplication): void {
    const peerServer = ExpressPeerServer(app.getHttpAdapter().getHttpServer())
    app.use(peerServer);
    peerServer.on("connection",(client)=>{
        console.log("Peer connection", client.getId())
    })
    peerServer.on("disconnect",(client)=>{
        console.log("Peer disconnect", client.getId())
    })
}
