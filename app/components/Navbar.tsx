// app/components/Navbar.tsx
import { useState } from "react";
import { NavLink } from "@remix-run/react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className='relative flex items-center min-w-screen bg-black text-white'>
      {/* Mobile Menu Button */}
      <ul className='flex p-4 w-full h-12 items-center justify-between sm:hidden'>
        <li onClick={showMenu} className='w-full pt-1'>
          <span className="menu material-symbols-outlined">menu</span>
        </li>
        <li className='w-full pt-1'>
          <span className="hidden md:flex">Baby Pulse</span>
        </li>
      </ul>

      {/* Desktop Menu */}
      <ul className='hidden p-4 w-full h-20 gap-4 sm:flex items-center justify-between'>
        <li className='flex items-center gap-2'>
          <span className='text-lg font-bold'>Baby Pulse</span>
        </li>
        <div className='flex-grow flex justify-center'>
          <NavLink to="/" className="px-4 py-2 rounded-lg navlink">Home</NavLink>
          <NavLink to="/products" className="px-4 py-2 rounded-lg navlink">Product</NavLink>
        </div>
      </ul>

      {/* Mobile Menu */}
      <ul className={`absolute z-[-1] top-12 flex-col p-4 w-screen origin-top rounded-b-md shadow-md transition-all duration-300 bg-black text-white ${isMenuOpen ? "show-menu" : "hidden"}`}>
        <li className='w-full'>
          <NavLink to="/" className="w-full px-2 py-1 rounded-lg navlink">Home</NavLink>
        </li>
        <li>
          <NavLink to="/products" className="px-2 py-1 rounded-lg navlink">Product</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
