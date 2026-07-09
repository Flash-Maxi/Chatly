import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

// Theme Provider Component
export function ThemeProvider({ children }) {
    // Check system preference and localStorage for initial theme
    const [isDark, setIsDark] = useState(() => {
        // Check if user has a saved preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('chatly-theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            // Otherwise check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Update localStorage and apply theme class to document when theme changes
    useEffect(() => {
        localStorage.setItem('chatly-theme', isDark ? 'dark' : 'light');

        // Apply dark class to html element for Tailwind dark mode
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            // Only update if user hasn't manually set a preference
            if (!localStorage.getItem('chatly-theme')) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Toggle theme function
    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    // Set specific theme
    const setTheme = (theme) => {
        if (theme === 'dark' || theme === 'light') {
            setIsDark(theme === 'dark');
        }
    };

    return (
        <ThemeContext.Provider value={{
            isDark,
            toggleTheme,
            setTheme,
            theme: isDark ? 'dark' : 'light'
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to use the theme context
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}