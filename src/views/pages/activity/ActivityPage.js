import React from "react";
import ChartistGraph from "react-chartist";
// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import LocationSelectMap from "../settings/general/LocationSelectMap";

function ActivityPage() {
  return (
    <>
      <Container fluid>
              <Row>
                <Col md="12">
                  <Card className="strpied-tabled-with-hover">
                    <Card.Header>
                      <Card.Title as="h4">Activity</Card.Title>
                      <p className="card-category">
                        Here is a subtitle for this table
                      </p>
                    </Card.Header>
                    <Card.Body className="table-full-width table-responsive px-0">
                      AM HERE
                      <LocationSelectMap/>
                      
                    </Card.Body>
                  </Card>
                </Col>
               
              </Row>
            </Container>
    </>
  );
}

export default ActivityPage;
