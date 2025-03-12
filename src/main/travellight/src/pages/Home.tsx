import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Hero />
        <Services />
        {/* 여기에 추가 섹션을 넣을 수 있습니다 */}
      </Box>
      <Footer />
    </Box>
  );
};

export default Home; 