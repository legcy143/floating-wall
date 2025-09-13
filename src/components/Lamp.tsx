import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const lampImages = [
  "/assets/lamp1.png",
  "/assets/lamp2.png",
  "/assets/lamp3.png",
  "/assets/lamp4.png",
];

function randomXaxis() {
  return Math.random() * Date.now() % 100 - 0.5;
}

type LampProps = {
  name?: string;
  feedback?: string;
  userImage?: string;
};

export default function Lamp(data: LampProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const floatingDiv = divRef.current;

    const animateDiv = () => {
      const tl = gsap.timeline({ repeat: 0 });

      tl.to(floatingDiv, {
        css: { top: "-44%", left: () => `${randomXaxis()}vw` },
        duration: 15,
        ease: "none",
        onStart: () => {
          const randomIndex = Math.floor(Math.random() * lampImages.length);
          floatingDiv.style.backgroundImage = `url(${lampImages[randomIndex]})`;
        },
      });

      return () => {
        tl.kill();
      };
    };

    const animation = animateDiv();

    return () => animation();
  }, []);

  return (
    <div
      ref={divRef}
      className="absolute text-white bottom-[-45vh]  flex flex-col justify-center items-center bg-cover h-[8rem] w-[6.5rem]"
      style={{
        backgroundImage: `url(${lampImages[0]})`,
        left: `${randomXaxis()}vw`,
      }}
    >
      <div className="mb-8 flex flex-col justify-center items-center">
     
        {
          data.userImage && <img src={data.userImage} className="size-[2.5rem] rounded-full object-cover mb-1" alt="User" />
        }
        <p className="text-white tracking-wider text-[13px] font-bold text-clip">
          {data.name?.toUpperCase()}
        </p>
        {/* <div className="text-[10px] text-white">{data.feedback}</div> */}
      </div>
      {/* <img src="https://cdnl.iconscout.com/lottie/premium/thumb/fire-7970677-6356283.gif" className="absolute rotate-180 w-56 top-44 left-8 opacity-75" /> */}
    </div>
  );
}
