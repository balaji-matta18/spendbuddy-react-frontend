import { useState } from "react";
// import { Link } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut } from "lucide-react";


export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  

  return (
    <nav className="w-full fixed top-0 z-50 bg-[#1a1a1a] py-6">

      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
          opacity: 0.45,
          WebkitMaskImage: `
            linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,1) 100%)
          `,
          maskImage: `
            linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,1) 100%)
          `,
          zIndex: -1,
        }}
      />

      {/* NAVBAR CAPSULE */}
      <div className="w-full flex justify-center">
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
            pl-10 pr-12
            // pl-10 pr-8 max-md:pr-1
            max-md:h-[75px]
            max-md:w-[95%]
          "
        >

                  <span className="
          text-[#539600]
          text-[36px]
          font-extrabold
          tracking-tight
          py-[3px]
          max-md:text-[19px]

          /* Move logo slightly left on mobile + tablet */
          ml-[-15px]      /* mobile */
          sm:ml-[-8px]   /* large mobile */
          md:ml-[-10px]  /* tablet */

          /* Keep desktop aligned normally */
          lg:ml-[-2px]
        ">
          SpendBuddy
        </span>


          {/* RIGHT — MENU + CTA (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-6 lg:ml-[-12px]">

                <Link
                to="/"
                className={`text-[16px] font-medium ${
                  location.pathname === "/" ? "text-[#daf180]" : "text-white"
                }`}
              >
                Home
          </Link>

                      <Link
            to="/dashboard"
            className={`text-[16px] font-medium ${
              location.pathname.startsWith("/dashboard") ? "text-[#daf180]" : "text-white"
            }`}
          >
            Dashboard
          </Link>

                          <Link
            to="/expenses"
            className={`text-[16px] font-medium ${
              location.pathname.startsWith("/expenses") ? "text-[#daf180]" : "text-white"
            }`}
          >
            Expenses
          </Link>

                  <Link
            to="/budgets"
            className={`text-[16px] font-medium ${
              location.pathname.startsWith("/budgets") ? "text-[#daf180]" : "text-white"
            }`}
          >
            Budgets
          </Link>

                    <Link
            to="/reports"
            className={`text-[16px] font-medium ${
              location.pathname.startsWith("/reports") ? "text-[#daf180]" : "text-white"
            }`}
          >
            Reports
          </Link>


            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="text-[#539600] text-[17px] font-semibold flex items-center gap-1"
              >
                Logout
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="text-[#539600] text-[17px] font-semibold flex items-center gap-1"
              >
                Get Started
                <span className="text-[22px]">›</span>
              </Link>
            )}
          </div>

          {/* RIGHT — CTA + HAMBURGER (MOBILE GROUPED TOGETHER) */}
          <div className="lg:hidden flex items-center gap-3 ml-auto pr-2">

            {/* CTA (Mobile) */}
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="text-[#539600] text-[15px] font-semibold flex items-center gap-1"
              >
                Logout
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="text-[#539600] text-[15px] font-semibold flex items-center gap-1"
              >
                Get Started
                <span className="text-[18px]">›</span>
              </Link>
            )}

            {/* HAMBURGER BUTTON */}
            <button
              className="h-[59px] w-[59px] rounded-full bg-[#2d2b2b] border border-[#2d2b2b]
                         flex items-center justify-center text-white"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={26} /> : <Menu size={20} />}
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="lg:hidden mt-3 mx-5 bg-[#2d2b2b] border border-[#2a2a2a] rounded-xl p-5 text-white flex flex-col gap-4">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/expenses" onClick={() => setOpen(false)}>Expenses</Link>
          <Link to="/budgets" onClick={() => setOpen(false)}>Budgets</Link>
          <Link to="/reports" onClick={() => setOpen(false)}>Reports</Link>

          {isAuthenticated ? (
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="text-[#539600] text-[17px] font-semibold flex items-center gap-1"
            >
              Logout
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="text-[#539600] text-[17px] font-semibold flex items-center gap-1"
            >
              Get Started
              <span className="text-[22px]">›</span>
            </Link>
          )}
        </div>
      )}

    </nav>
  );
};