import Image from "next/image";
import Header from "./Header";
import Link from "next/link";

interface HeroProps {
  imageUrl: string;
  imageAlt: string;
  heading: string;
  subheading: string;
  buttonText: string;
}

export default function Hero(props: HeroProps) {
  return (
    <div className="relative h-screen">
      <Image
        src={props.imageUrl}
        alt={props.imageAlt}
        layout="fill"
        objectFit="cover"
      />
      <div className="flex flex-col justify-center items-center absolute inset-0 bg-black bg-opacity-50 text-white">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">{props.heading}</h1>
        <p className="text-lg md:text-2xl text-center mb-8 px-4 md:px-0 w-[75vh]">
          {props.subheading}
        </p>
        <Link href={"/projects"}>
          <button className="bg-orange-500 text-white px-6 py-3 text-lg rounded-md shadow-md hover:bg-orange-600 transition duration-300">
            {props.buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
}
