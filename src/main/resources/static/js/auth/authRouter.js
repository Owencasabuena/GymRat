// ==========================================
// AUTH ROUTER
// Protects routes that require authentication
// ==========================================

import { isAuthenticated, getUser } from '/js/auth/authService.js';

// ==========================================
// ROUTE PROTECTION
// ==========================================

function protectRoute() {
    if (!isAuthenticated()) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        console.log('Already authenticated, redirecting to dashboard');
        window.location.href = '/dashboard.html';
        return true;
    }
    return false;
}

// ==========================================
// SETUP
// ==========================================

function setupAuthRouter() {
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    console.log('Is authenticated:', isAuthenticated());

    // Public pages (no auth required) - use exact matches
    const publicPages = ['/login.html', '/register.html', '/index.html', '/'];

    // Protected pages (auth required)
    const protectedPages = ['/dashboard.html'];

    // Check if current page is protected (exact match)
    const isProtectedPage = protectedPages.some(page =>
        currentPath === page || currentPath.endsWith(page)
    );

    // Check if current page is public auth page (exact match, exclude dashboard)
    const isPublicAuthPage = publicPages.some(page =>
        currentPath === page || currentPath.endsWith(page)
    ) && !isProtectedPage;

    console.log('Is protected page:', isProtectedPage);
    console.log('Is public auth page:', isPublicAuthPage);

    // Protect routes that require authentication
    if (isProtectedPage) {
        protectRoute();
        return; // Stop here if protecting route
    }

    // DON'T redirect if already on auth pages
    // This allows users to manually navigate to login/register
    // They can logout from dashboard if needed
}

// Run on page load
document.addEventListener('DOMContentLoaded', setupAuthRouter);

export { protectRoute, redirectIfAuthenticated, setupAuthRouter };