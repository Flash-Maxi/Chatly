import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from "react-redux"
import { store } from './redux/store.js'

export const serverUrl = "http://localhost:5000"

// Create root idempotently to avoid "createRoot called twice" warnings
const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')

if (!container.__reactRoot) {
    const root = createRoot(container)
    container.__reactRoot = root
    root.render(
        <BrowserRouter>
            <Provider store={store}>
                <App />
            </Provider>
        </BrowserRouter>
    )
} else {
    // If a root was already created, call render on it
    container.__reactRoot.render(
        <BrowserRouter>
            <Provider store={store}>
                <App />
            </Provider>
        </BrowserRouter>
    )
}
