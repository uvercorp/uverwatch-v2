import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function PagesNotFound() {
  return (
    <div className="text-center min-h-lvh my-gradient-bg" style={{ padding: "100px 0",color:"white" }}>
      <h1 style={{color:"antiquewhite"}}>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist.</p>
      <Button as={Link} to="/pages/login" style={{backgroundColor:"#165b44",borderRadius:0}}
      className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center ">
        Go to Login Page
      </Button>
    </div>
  );
}