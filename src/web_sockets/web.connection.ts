import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Socket, Server} from "socket.io";
let socketID:any = []
@WebSocketGateway()
export class WebConnection implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server

    @SubscribeMessage("connection")

    handleDisconnect(client:Socket){
        console.log("Disconnect Users",client.id)
        socketID.forEach((data:any,index:any)=>{
            if(data === client.id){
                socketID.splice(index,1)
            }
        })
    }

    handleConnection(client:Socket){
        console.log("Connected Users",client.id)
        socketID.push(client.id)
    }

    @SubscribeMessage("socketRoom")
    sendSocketID(client:Socket,payload:any){
        client.join(payload.createRoom,()=>{
            console.log("Creating Room",payload.createRoom)
        }) 
    }

    @SubscribeMessage("joinRoom")
    getJoinRoom(client:Socket,payload:any){
        client.join(payload.joinRoom,()=>{
            console.log("Joining Room", payload.joinRoom)
        })
        client.emit("roomJoined","hello")
    }

    @SubscribeMessage("candidate")
    gotCandidate(client:Socket,payload:any) {
        let otherRoomID = client.adapter.rooms
        let arrayID = Object.keys(otherRoomID)
        let filterSocketID = arrayID.filter((data)=>{
            return data != client.id
        })
        this.server.to(filterSocketID[0]).emit("sendIceCandidate",{id: client.id, ...payload})
    }

    @SubscribeMessage("createOffer")
    gettingOffer(client:Socket,payload:any) {
        let otherRoomID = client.adapter.rooms
        let arrayID = Object.keys(otherRoomID)
        let filterSocketID = arrayID.filter((data)=>{
            return data != client.id
        })
        this.server.to(filterSocketID[0]).emit("sendOffer",payload)
    }

    @SubscribeMessage("createAnswer")
    gettingAnswer(client:Socket,payload:any) {
        let otherRoomID = client.adapter.rooms
        let arrayID = Object.keys(otherRoomID)
        let filterSocketID = arrayID.filter((data)=>{
            return data != client.id
        })
        this.server.to(filterSocketID[0]).emit("sendAnswer",payload)
    }

}