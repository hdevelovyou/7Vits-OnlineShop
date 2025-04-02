import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RouterCustom from './router';
import "./style/style.scss";
const root = createRoot(document.getElementById('root'));
root.render(
   <div>
        <BrowserRouter>
            <RouterCustom />
        </BrowserRouter>
   </div>
);

