// import React from "react";
// import ChartistGraph from "react-chartist";
// // react-bootstrap components
// import {
//   Badge,
//   Button,
//   Card,
//   Navbar,
//   Nav,
//   Table,
//   Container,
//   Row,
//   Col,
//   Form,
//   OverlayTrigger,
//   Tooltip,
// } from "react-bootstrap";
// import LocationSelectMap from "../settings/general/LocationSelectMap";

// function DashboardPage() {
//   return (
//     <>
//       <Container fluid>
//               <Row>
//                 <Col md="12">
//                   <Card className="strpied-tabled-with-hover">
//                     <Card.Header>
//                       <Card.Title as="h4">Dashboard</Card.Title>
//                       <p className="card-category">
//                         Here is a subtitle for this table
//                       </p>
//                     </Card.Header>
//                     <Card.Body className="table-full-width table-responsive px-0">
//                       AM HERE
//                       <LocationSelectMap/>
                      
//                     </Card.Body>
//                   </Card>
//                 </Col>
               
//               </Row>
//             </Container>
//     </>
//   );
// }

// export default DashboardPage;
import React from 'react';

const DashboardPage = () => {
  const taskings = [
    'Tamale Water Shortage',
    'Dansoman Riots',
    'Bono East Food Shortage',
    'Naija Drug Cartel',
    'Koforidua Vigilantes',
    'Water Shortage',
    'Election Monitoring',
    'Public Sentiment Kevin Taylor',
    'Price of goods',
    'Corruption',
    'Bribery',
    'Police brutality',
  ];

  const tabs = ['System', 'Schema', 'Accesses', 'Tools'];

  return (
    <div className="min-h-screen bg-black text-white font-mono px-8">
      
      <div className='flex items-start space-x-8'>
      <h1 className="text-4xl  my-font-family-ailerons tracking-widest mb-6">SETTINGS</h1>

      {/* Tabs */}
      <div className="flex space-x-0 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 my-font-family-overpass-mono border ${
              tab === 'Schema' ? 'bg-gray-700 border-white' : 'bg-gray-900 border-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      </div>

      <div className="flex space-x-8">
        {/* Left panel */}
        <div className="space-y-4 w-1/3 my-scrollbar h-[550px]">
          <SettingCard title="Tasking:" description="Create and configure task surveys to inform data collected on the ground..." selected />
          <SettingCard title="Categories:" description="Create categories that reports and entities can be grouped under..." />
          <SettingCard title="Links:" description="List of links which can be made amongst reports & entities..." />
          <SettingCard title="Entity Layer:" description="Create and configure entities collected within your deployment..." />
          <SettingCard title="Tags:" description="Create tags and subtags that reports and entities can be grouped under..." />
        </div>

        {/* Right panel */}
        <div className="w-2/3">
          <h2 className="text-2xl mb-4">Taskings:</h2>
          <div className="grid grid-cols-2 gap-2">
            {taskings.map((task, idx) => (
              <div
                key={idx}
                className="border border-white px-4 py-2 hover:bg-gray-800 transition duration-200 cursor-pointer"
              >
                <span className="text-sm">{String(idx + 1).padStart(2, '0')}</span> {task}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingCard = ({ title, description, selected = false }) => (
  <div
    className={`p-2 text-left ${
      selected ? 'bg-[#a8a9ab] text-[#3c3d3f]' : 'bg-[#333333] '
    }`}
    style={{border:"1px solid #515153"}}
  >
    <h3 className="font-semibold text-lg mb-1 my-font-family-overpass-mono">{title}</h3>
    <p className="text-sm ">{description}</p>
  </div>
);

export default DashboardPage;
