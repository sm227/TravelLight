import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        width: '100%', 
        margin: 0, 
        padding: 0,
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Hero />
        <Services />
        {/* 추가 섹션은 여기에 추가하세요 */}
      </Box>
      <Footer />
    </Box>
  );
};

export default Home; 