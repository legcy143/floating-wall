"use client";
import Lamp from "@/components/Lamp";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import gsap from "gsap";
import feedbackOptions from "@/utils/feedbackOptions";
const socket = io("https://api.gokapturehub.com", {
  transports: ["websocket"],
});

import Logo from "../../../public/assets/logo.png";

const Page: React.FC = () => {
  const [lamps, setLamps] = useState<any>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [renderIndex, setRenderIndex] = useState(0);

  useEffect(() => {
    const handleWallEvent = (data: any) => {
      setLamps((prevLamps: any) => [...prevLamps, data]);
    };

    socket.on("wall", handleWallEvent);

    // Clean up the event listener when the component unmounts or before re-running the effect
    return () => {
      socket.off("wall", handleWallEvent);
    };
  }, []);

  useEffect(() => {
    const getLamps = async () => {
      const res = await axios.get("https://api.gokapturehub.com/floating-wall");
      setLamps(res.data);
      console.log(res.data);
    };

    getLamps();

    // let timer: NodeJS.Timeout;

    // timer = setInterval(() => {
    //   const randomLamps = Array.from({ length: 2 }, () => ({
    //     name: "",
    //     feedback:
    //       feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
    //   }));
    //   setLamps((prevLamps: any) => [...prevLamps, ...randomLamps]);
    // }, 10000);

    // return () => {
    //   clearTimeout(timer);
    // };
  }, []);

  useEffect(() => {
    if (showWelcome) {
      gsap.fromTo(
        ".welcome",
        { y: "100%", opacity: 0, filter: "blur(100px)" },
        {
          y: "0%",
          opacity: 1,
          filter: "blur(0px)",
          duration: 5,
          ease: "power3.out",
        }
      );
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
      <img src={Logo.src} alt="logo" className="w-44 absolute top-5 left-5" />

      {/* {showWelcome && (
        <img src={"./assets/event-welcome.jpg"} className="welcome bg-[var(--event-theme)] object-cover" alt="Welcome" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }} />
      )} */}
      {!showWelcome &&
        lamps
          .slice(0, renderIndex)
          .map((lamp: any, i: number) => (
            <Lamp key={i} feedback={lamp.feedback} name={lamp.name} />
          ))}
    </div>
  );
};

export default Page;
