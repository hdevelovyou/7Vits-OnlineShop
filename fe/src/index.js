import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RouterCustom from './router';



const root = createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <RouterCustom />
    </BrowserRouter>
);

