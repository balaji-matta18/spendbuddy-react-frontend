import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut } from "lucide-react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();

  return (
    <nav className="w-full fixed top-0 z-50 bg-[#1a1a1a] py-6">

      {/* GRID BEHIND NAVBAR — HIDDEN INSIDE CAPSULE, FADES BELOW */}
      <div
      className="absolute inset-0 pointer-events-none"
        style={{
        
      // <<< controls vertical size

          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
          opacity: 0.45,

          // MASK hides the grid inside the navbar capsule area
          WebkitMaskImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) 55%,
              rgba(0,0,0,1) 100%
            )
          `,
          maskImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) 55%,
              rgba(0,0,0,1) 100%
            )
          `,
          zIndex: -1,
        }}
      />

      {/* NAVBAR CONTENT */}
      <div className="w-full flex justify-center">

        {/* AXIO-STYLE NAV PILL */}
        <div
          className="
            bg-[#1a1a1a]
            border border-[#2a2a2a]
            rounded-full
            shadow-[0_0_40px_rgba(0,0,0,0.4)]
            h-[80px]
            w-[90%]
            max-w-[1550px]
            flex items-center justify-between
            pl-[38px] pr-[55px]

            max-md:h-[75px]
            max-md:w-[95%]
            max-md:px-[25px]
          "
        >

          {/* LOGO */}
          <div className="flex items-center">
            <span
              className="
                text-[#539600]
                text-[36px]
                font-extrabold
                tracking-tight
                py-[3px]

                max-md:text-[19px]
              "
            >
              SpendBuddy
            </span>
          </div>

          {/* CENTER LINKS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-[28px] ml-[418px]">
            <Link to="/" className="text-white text-[16px] font-medium">Home</Link>
            <Link to="/dashboard" className="text-white text-[16px] font-medium">Dashboard</Link>
            <Link to="/expenses" className="text-white text-[16px] font-medium">Expenses</Link>
            <Link to="/budgets" className="text-white text-[16px] font-medium">Budgets</Link>
            <Link to="/reports" className="text-white text-[16px] font-medium">Reports</Link>
          </div>

          {/* RIGHT-SIDE CTA (DESKTOP) */}
          <div className="hidden md:flex">
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="
                  text-[#539600]
                  text-[17px]
                  font-semibold
                  flex items-center gap-1
                "
              >
                Logout
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="
                  text-[#539600]
                  text-[17px]
                  font-semibold
                  flex items-center gap-1
                "
              >
                Get Started
                <span className="text-[22px]">›</span>
              </Link>
            )}
          </div>

          {/* MOBILE CTA */}
          <div className="md:hidden flex items-center mr-3">
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="
                  text-[#539600]
                  text-[16px]
                  font-semibold
                  flex items-center gap-1
                  ml-auto mr-[-141px]
                "
              >
                Logout
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="
                  text-[#539600]
                  text-[16px]
                  font-semibold
                  flex items-center gap-1
                  ml-[50px]
                "
              >
                Get Started
                <span className="text-[20px]">›</span>
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div
            className="
              md:hidden
              h-[59px] w-[59px]
              rounded-full
              bg-[#2d2b2b]
              border border-[#2d2b2b]
              flex items-center justify-center
              ml-auto mr-[-16px]
            "
          >
            <button className="text-white" onClick={() => setOpen(!open)}>
              {open ? <X size={26} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden mt-3 mx-5 bg-[#2d2b2b] border border-[#2a2a2a] rounded-xl p-5 text-white flex flex-col gap-4">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/expenses" onClick={() => setOpen(false)}>Expenses</Link>
          <Link to="/budgets" onClick={() => setOpen(false)}>Budgets</Link>
          <Link to="/reports" onClick={() => setOpen(false)}>Reports</Link>
        </div>
      )}
    </nav>
  );
};
