import React from "react";
import { FaLinkedinIn } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className="flex justify-center bg-cyan-500 bottom-0 fixed w-full">
      <div>
        <a
          href="https://www.linkedin.com/in/avradeep-nayak-7604b5222/"
          target="_blank"
          rel="noopener noreferrer"
          className=""
        >
          <p className="flex items-center p-2 ">
            <FaLinkedinIn size={20} className="flex mx-2" />
            Made by<b className="ml-1 font-sans">Avradeep</b>😎
          </p>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
