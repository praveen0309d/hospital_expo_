import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";

const PharmacyDashboard = () => {
  const navigate = useNavigate();

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  const hoverEffect = {
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
    transition: {
      duration: 0.3
    }
  };

  const tapEffect = {
    scale: 0.98
  };

  return (
    <DashboardContainer>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Pharmacy Dashboard</h1>
        <p>Manage your pharmacy operations efficiently</p>
      </Header>

      <CardsContainer>
        <Card
          variants={cardVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          whileHover={hoverEffect}
          whileTap={tapEffect}
          onClick={() => navigate("/pharmacy/manage-stock")}
          bg="#ffffff"
          color="#2c3e50"
        >
          <IconContainer>
            <i className="fas fa-pills"></i>
          </IconContainer>
          <h3>Manage Stock</h3>
          <p>View and update medication inventory</p>
        </Card>

        <Card
          variants={cardVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          whileHover={hoverEffect}
          whileTap={tapEffect}
          onClick={() => navigate("/pharmacy/prescriptions")}
          bg="#20c997"
          color="#fff"
        >
          <IconContainer>
            <i className="fas fa-file-prescription"></i>
          </IconContainer>
          <h3>View Prescriptions</h3>
          <p>Process patient prescriptions</p>
        </Card>
      </CardsContainer>

      <Footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <p>Pharmacy Management System © {new Date().getFullYear()}</p>
      </Footer>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1.1rem;
    color: #7f8c8d;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: ${props => props.bg};
  color: ${props => props.color};
  padding: 2rem;
  border-radius: 15px;
  width: 280px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 1.5rem;
    margin: 1rem 0 0.5rem;
  }
  
  p {
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const IconContainer = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Footer = styled(motion.footer)`
  text-align: center;
  margin-top: 4rem;
  padding: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

export default PharmacyDashboard;