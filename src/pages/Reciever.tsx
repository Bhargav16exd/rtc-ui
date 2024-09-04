import { useEffect, useRef, useState} from "react"


export default function Reciever(){

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream  , setLocalStream] = useState<any>(null)
  const [remoteStream , setRemoteStream] = useState<any>(null)

  // Gettting the local stream

 
  useEffect(()=>{
  
    let pc : RTCPeerConnection | null = null
    const socket = new WebSocket('wss://rtc-core.onrender.com')
    
    socket.onopen = () => {
        socket.send(JSON.stringify({type:'reciever'}))
    }

    socket.onmessage = async (event) => {
      
      const message = JSON.parse(event.data)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      
      if(message.type == 'createOffer'){

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

            Remote Video
           <Video remoteVideoRef={remoteVideoRef} stream={remoteStream} audioPlay={audioPlay} /> 


            {
              localStream ? 
              <div>
                <video autoPlay ref={localVideoRef} muted style={{width:"400px" , height:'400px'}}/> 
              </div>
              : <>Nothing to load</>
            }
    
         </div>
        </>
    )
}

function Video({stream , remoteVideoRef , audioPlay }:any){

  return<>{
    stream ? 
    <div>
     <video autoPlay ref={remoteVideoRef} muted style={{width:"400px" , height:'400px'}}/> 
     <button onClick={audioPlay}>Connect the audio </button>
    </div>
      : <>Nothing to load</>} 
    
    </>
}