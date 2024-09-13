import { useEffect, useRef, useState} from "react"
import CallPage from "./CallPage";


export default function Reciever(){

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream  , setLocalStream] = useState<any>(null)
  const [remoteStream , setRemoteStream] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState({ senderConnected: false, receiverConnected: false });



  // Gettting the local stream

 
  useEffect(()=>{
  
    let pc : RTCPeerConnection | null = null
    //const socket = new WebSocket('wss://rtc-core.onrender.com')
    const socket = new WebSocket('ws://localhost:8080');
    
    socket.onopen = () => {
        socket.send(JSON.stringify({type:'reciever'}))
    }

    socket.onmessage = async (event) => {
      
      const message = JSON.parse(event.data)
      

      if (message.type === "connectionStatus") {
        setConnectionStatus({
          senderConnected: message.senderConnected,
          receiverConnected: message.receiverConnected,
        });
        return;
      }
      
      if(message.type == 'createOffer'){

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.relay.metered.ca:80",
            },
            {
              urls: "turn:global.relay.metered.ca:80",
              username: "fc666044289cd4f59c7d6862",
              credential: "eevwIhFSCVwbfqP6",
            },
            {
              urls: "turn:global.relay.metered.ca:80?transport=tcp",
              username: "fc666044289cd4f59c7d6862",
              credential: "eevwIhFSCVwbfqP6",
            },
            {
              urls: "turn:global.relay.metered.ca:443",
              username: "fc666044289cd4f59c7d6862",
              credential: "eevwIhFSCVwbfqP6",
            },
            {
              urls: "turns:global.relay.metered.ca:443?transport=tcp",
              username: "fc666044289cd4f59c7d6862",
              credential: "eevwIhFSCVwbfqP6",
            },
        ]
        });
        pc.setRemoteDescription(message.sdp)

        pc.onicecandidate = (event) => {
          if(event.candidate){
              socket?.send(JSON.stringify({type:'iceCandidate', candidate:event.candidate}))
          }
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('ICE Candidate:', event.candidate);
            socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
          } else {
            console.log('All ICE candidates have been sent');
          }
        };

       
        pc.ontrack = (event) => {  
          if(event.streams && event.streams[0]){
            setRemoteStream(event.streams[0])
          }
        }
        
        stream.getTracks().forEach(track => pc?.addTrack(track, stream));

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer) 
        socket?.send(JSON.stringify({type:'answerOffer',sdp:pc.localDescription}))


      }else if( message.type == 'iceCandidate'){
        // @ts-ignore
        pc?.addIceCandidate(message.candidate)
      }

    }

  },[])

 
  useEffect(()=>{
    if(remoteVideoRef.current && remoteStream){
      remoteVideoRef.current.srcObject = remoteStream
    } 
  },[remoteStream])

  useEffect(()=>{

    if(localVideoRef.current && localStream){
      localVideoRef.current.srcObject = localStream
    } 
  },[localStream])




  function audioPlay(){
    //@ts-ignore
    remoteVideoRef.current.muted = false
  }

 
    return(
        <>

         <div style={{width:"100vh" , height:'100wv'}}>

         <p>{connectionStatus.senderConnected ? "Sender Connected" : "Sender Not Connected"}</p>
         <p>{connectionStatus.receiverConnected ? "Receiver Connected" : "Receiver Not Connected"}</p>
     

         <CallPage localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} audioPlay={audioPlay}/>
            
  
    
         </div>
        </>
    )
}

