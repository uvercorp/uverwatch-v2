import React, { useState, useRef, useEffect } from "react";
import { useLocation, useHistory,NavLink } from "react-router-dom";
import routes from "../../routes.js";

function Header({ isLogin, user }) {
  const location = useLocation();
  const navigate = useHistory();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Not Found";
  };

  const showSearchComponent =
    location.pathname === "/deployment/data_view" ||
    location.pathname === "/deployment/incoming" ||
    location.pathname === "/deployment/map_view";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (<>
  {!showSearchComponent && (<>
    <div className="lg:fixed lg:top-0 lg:left-[17%] right-0 lg:z-50 bg-black border-b border-gray-700">
    {/* <div className="lg:w-[100%] lg:border-b border-gray-700"> */}

             <div className="flex justify-between my-black-bg items-center p-1 lg:mx-4 ">
                <h1 className="text-2xl tracking-widest my-font-family-ailerons text-white hidden lg:block">{getBrandText()}</h1>

                <div
              className="flex items-center space-x-4 pt-3 lg:pt-0 mb-1 mr-2 relative"
              ref={dropdownRef}
            >
              <span className="text-sm my-sidebar-color my-font-family-courier-prime lg:hidden">
                {user?.name?.split(" ")[0]}
              </span>

              {/* User icon (Font Awesome) */}
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="text-white text-lg border border-gray-500 w-8 h-8 rounded-full p-"
              >
                <i className="fas fa-user" />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 bg-gray-900 text-white border border-gray-700 rounded shadow-md w-48 z-50">
                 {isLogin === "yes" && (<>
                  <div className="px-4 py-2 text-sm border-b border-gray-700">
                    {user?.name}
                  </div>

                  {/* <a
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-800 text-sm"
                  >
                    View Profile
                  </a> */}
                  <NavLink
              to='user'
              className="block px-4 py-2 hover:bg-gray-800 text-sm"
              activeClassName="active"
            >
              {/* <i className="nc-icon  nc-circle-09" /> */}
              User Profile
            </NavLink>

                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-red-400"
                  onClick={() => {
                    localStorage.setItem("is_login", "no");
                    localStorage.removeItem("currentUser");
                    window.location.replace("/pages/login");
                  }}
                >
                  Log out
                </button>
              </>)}
              {localStorage.getItem("is_login") === "no" && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-red-400"
                  onClick={() => {
                    window.location.replace("/pages/login");
                  }}
                >
                  Login
                </button>
              )}
                </div>
              )}
            </div>
              </div>
            </div>
            <div className="h-[65px]"></div>
              </>)}

  </>);
}

export default Header;
