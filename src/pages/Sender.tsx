import { useEffect, useRef, useState } from "react"

export default function Sender(){

    const [socket , setSocket] = useState<WebSocket | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    

    useEffect(()=>{
        const socket = new WebSocket('wss://rtc-core.onrender.com')
    
        socket.onopen = () => {
            socket.send(JSON.stringify({type:'sender'}))
        }

       setSocket(socket);     

    },[])

    async function startSendingVideo(){

        const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
        setStream(stream)

        if(!socket){
            return
        }

        const pc = new RTCPeerConnection({
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
        stream.getTracks().forEach(track => pc?.addTrack(track, stream));
          
        
        pc.onnegotiationneeded = async() => { 
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer)
            socket?.send(JSON.stringify({type:'createOffer', sdp:pc.localDescription}))
        }

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
 
        socket.onmessage = async (event) => {

            const message = JSON.parse(event.data)

            if(message.type === 'answerOffer'){
                await pc.setRemoteDescription(message.sdp)
            }
            else if(message.type === 'iceCandidate'){
                await pc.addIceCandidate(message.candidate)
            }

        }

    }
    useEffect(()=>{
        if(remoteVideoRef.current && remoteStream){
          remoteVideoRef.current.srcObject = remoteStream
        }
    },[remoteStream])

    useEffect(()=>{
        if(localVideoRef.current && stream){
          localVideoRef.current.srcObject = stream
        }
    },[stream])


    return(
        <>
         <button onClick={startSendingVideo}>Start the call</button>

         Local Video 
         <video autoPlay ref={localVideoRef} muted style={{width:"300px" , height:'300px'}}/>

         Remote Video 
         <video autoPlay ref={remoteVideoRef} muted style={{width:"300px" , height:'300px'}}/>
        </>
    )
}