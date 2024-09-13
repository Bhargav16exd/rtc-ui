import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function CallPage({ localVideoRef, remoteVideoRef, audioPlay }: any) {
  
  
  const [isMute , setIsmute] = useState(true)

  function mute(){
    setIsmute(true)
  }
  function unmute(){
    setIsmute(false)
  }

  return (

      <>
          <div className="h-screen w-screen ">
             

              <div className="h-[90%] mt-10 mx-10 relative">

                  <video
                      autoPlay
                      ref={remoteVideoRef}
                      muted
                      className="rounded-xl"
                      style={{ height: "100%", width: "100%", objectFit:"cover" }}
                  />
           


                <div className="h-auto w-auto">
                  <video 
                   autoPlay
                   ref={localVideoRef} 
                   muted 
                   className="absolute z-10 right-5 bottom-5  rounded-xl" 
                   style={{ width: "300px", height: "200px", objectFit:"cover" }} />
                </div>
            
                  {
                    isMute ?
                    <div className="absolute bottom-5 left-[600px] bg-[#D9D9D9] px-2 py-2 rounded-full" onClick={()=>{unmute(); audioPlay()}}>
                        <FontAwesomeIcon icon={faMicrophoneSlash} className="z-10 h-10 w-20" />
                    </div> 
                    :
                    <div className="absolute bottom-5 left-[600px] bg-[#D9D9D9] px-2 py-2 rounded-full" onClick={()=>{mute();}}>
                          <FontAwesomeIcon icon={faMicrophone}  className="z-10 h-10  w-20" />
                    </div>
                                
                  }
                 
        
               

              </div>

              

             

          </div>
      </>
  );
}
