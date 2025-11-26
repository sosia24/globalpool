'use client'
import Image from "next/image";
import { LuUserCheck } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";


export default function Header() {

    const pathname = usePathname();

    if (pathname === "/") {
      return null;
    }

  return (
    
    <div className="absolute z-10 top-20 right-40 flex items-center">
    <header className="flex justify-center text-black gap-5 max-w-[700px]  py-2 px-12 rounded-xl items-center bg-[#FFCD00]">
      <h1>Pool Global</h1>
      <p className="bg-[#DBB000] px-3 py-1 rounded-md">Pool</p>
      <p>Network</p>
      <div className="bg-[#C4A00B] flex items-center py-2 px-5 rounded-lg">
          <LuUserCheck className="text-white relative right-2 size-6"></LuUserCheck>
          <p>0x8804...987468</p>
      </div>
    </header>
    <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center -right-10 absolute bg-black border-4 border-[#FFCD00]">
    <Image src={'/logo_header.png'} height={40} width={40} alt="logo"></Image>
    <div className="w-[15px] h-[15px] rounded absolute -bottom-[9px] justify-center  items-center flex flex-col  bg-[#FFCD00]">
    
      <IoIosArrowDown className="w-[50px] h-[50px] relative top-[2px] text-black"></IoIosArrowDown>
      <IoIosArrowDown className="w-[50px] h-[50px] relative bottom-[2px] text-black"></IoIosArrowDown>


    </div>
    </div>
    </div>

  );
}
