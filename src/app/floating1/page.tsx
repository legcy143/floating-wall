"use client";
import Lamp from "@/components/Lamp";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import gsap from "gsap";
import welcome from "../../../public/assets/welcom.png";
const socket = io("https://mosaic-api.gokapturehub.com", {
  transports: ["websocket"],
});

const Page: React.FC = () => {
  const [lamps, setLamps] = useState<any>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [renderIndex, setRenderIndex] = useState(0); 

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("wall", (data: any) => {
      setLamps((prevLamps: any) => [...prevLamps, data]);
    });

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "r" && !showWelcome) {
        setShowWelcome(true);
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [showWelcome]);

  useEffect(() => {
    const getLamps = async () => {
      const res = await axios.get("https://api.gokapturehub.com/wall-test");
      setLamps(res.data.data);
      console.log(res.data.data)
    };

    getLamps();

    let timer: NodeJS.Timeout;

    timer = setInterval(() => {
      const randomLamps = Array.from({ length: 2 }, () => ({
        feedback: "",
        name: "",
      }));
      setLamps((prevLamps: any) => [...prevLamps, ...randomLamps]);
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (showWelcome) {
      gsap.fromTo(".welcome", { y: "100%" }, { y: "0%", duration: 5, ease: "power3.out" });
    }
  }, [showWelcome]);

  useEffect(() => {
    if (!showWelcome) {
      const timeout = setTimeout(() => {
        setRenderIndex((prevIndex) => prevIndex + 1);
      }, 1000); 
  
      return () => clearTimeout(timeout);
    }
  }, [renderIndex, showWelcome]);

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-[url('/assets/bg.png')] relative overflow-hidden">
      {showWelcome && (
        <img src={welcome.src} className="welcome" alt="Welcome" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }} />
      )}
      {!showWelcome && lamps.slice(0, renderIndex).map((lamp: any, i: number) => (
        lamp.name && lamp.feedback && <Lamp key={i} feedback={lamp.feedback} name={lamp.name} />
      ))}
    </div>
  );
};

export default Page;
