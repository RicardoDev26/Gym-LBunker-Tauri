import { invoke } from '@tauri-apps/api/core';
import React, { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';


const App = () => {
  return (
    <div>
      <HomeScreen />
    </div>
  )
};

export default App;
