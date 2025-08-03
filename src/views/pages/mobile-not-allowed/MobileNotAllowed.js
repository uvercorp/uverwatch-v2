import { Button } from 'react-bootstrap';
import { useLocation, useHistory } from "react-router-dom";

export default function MobileNotAllowed() {
    let navigate = useHistory();

  return (
    <div className="text-center min-h-lvh my-gradient-bg" style={{ padding: "100px 0",color:"white" }}>
    <h2 style={{color:"antiquewhite"}}>Mobile Access Restricted</h2>
      <p className="mb-4">This feature is only available on desktop devices.</p>
      <Button  onClick={() => navigate.push('/deployment/dashboard')} style={{backgroundColor:"#165b44",borderRadius:0}}
      className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center ">
        Return to Dashboard
      </Button>
    </div>
  );
};