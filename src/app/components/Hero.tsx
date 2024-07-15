"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Typewriter from "typewriter-effect";

interface HeroProps {
  imageUrl: string;
  imageAlt: string;
  heading: string;
  buttonText: string;
}

export default function Hero(props: HeroProps) {
  const router = useRouter();

  const handleClick = () => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/projects");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative h-screen">
      <Image
        src={props.imageUrl}
        alt={props.imageAlt}
        layout="fill"
        objectFit="cover"
        priority={true}
      />
      <div className="flex flex-col justify-center items-center absolute inset-0 bg-black bg-opacity-50 text-white">
        <h1 className="text-4xl md:text-6xl lg:text-8xl text-center font-bold mb-4 px-6 md:px-0">
          {props.heading}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-center mb-4 px-6 md:px-0 max-w-xl">
          Get the necessary development experience for successful employment
          with pet projects from PracticeCraft.AI
        </p>
        <div className="text-lg md:text-xl lg:text-2xl text-center mb-4 px-6 md:px-0 max-w-xl">
          <Typewriter
            options={{
              strings: [
                "Create your own pet project idea",
                "Ask mentor if you're stuck or feeling confused",
                "Discuss projects with a big, friendly community",
                "Have fun",
              ],
              autoStart: true,
              loop: true,
              delay: 25,
              deleteSpeed: 10,
              cursor: "|",
            }}
          />
        </div>
        <button
          className="bg-orange-500 text-white px-6 py-3 text-lg md:text-xl rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold"
          onClick={handleClick}
        >
          {props.buttonText}
        </button>
      </div>
    </div>
  );
}
