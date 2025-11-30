import { switchTab } from '../dashboard.js';

export function renderAdminUsers(data) {
    const contentArea = document.getElementById('content-area');
    
    // Helper to render a list of emails
    const renderList = (provider, emails) => {
        return (emails || []).map((email, index) => `
            <div class="flex items-center justify-between bg-gray-700 p-2 rounded mb-2">
                <span class="text-white text-sm">${email}</span>
                <button type="button" onclick="removeAdminUser('${provider}', ${index})" class="text-red-400 hover:text-red-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `).join('');
    };

    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-6">Manage Admin Users</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
            <!-- Google -->
            <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                    <span class="mr-2">Google</span>
                </h3>
                <div id="list-google.com" class="mb-4">
                    ${renderList('google.com', data['google.com'])}
                </div>
                <div class="flex gap-2">
                    <input type="email" id="input-google.com" placeholder="Add Google Email" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    <button onclick="addAdminUser('google.com')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">+</button>
                </div>
            </div>

            <!-- GitHub -->
            <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                    <span class="mr-2">GitHub</span>
                </h3>
                <div id="list-github.com" class="mb-4">
                    ${renderList('github.com', data['github.com'])}
                </div>
                <div class="flex gap-2">
                    <input type="text" id="input-github.com" placeholder="Add GitHub Email/UID" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    <button onclick="addAdminUser('github.com')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">+</button>
                </div>
            </div>

            <!-- Password -->
            <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                    <span class="mr-2">Password</span>
                </h3>
                <div id="list-password" class="mb-4">
                    ${renderList('password', data['password'])}
                </div>
                <div class="flex gap-2">
                    <input type="email" id="input-password" placeholder="Add Email" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    <button onclick="addAdminUser('password')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">+</button>
                </div>
            </div>

            <!-- Microsoft (Disabled) -->
            <div class="bg-gray-800 p-4 rounded border border-gray-700 opacity-60 relative overflow-hidden">
                <div class="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
                    <span class="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">Coming Soon</span>
                </div>
                <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                    <span class="mr-2">Microsoft</span>
                </h3>
                <div class="mb-4">
                    <p class="text-gray-500 text-sm">Configuration disabled.</p>
                </div>
                <div class="flex gap-2">
                    <input type="email" disabled placeholder="Add Microsoft Email" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-500 cursor-not-allowed">
                    <button disabled class="bg-gray-600 text-gray-400 px-3 py-1 rounded text-sm cursor-not-allowed">+</button>
                </div>
            </div>
        </div>
    `;
}

export async function addAdminUser(provider) {
    const input = document.getElementById(`input-${provider}`);
    const value = input.value.trim();
    if (!value) return;

    if (!window.currentData[provider]) window.currentData[provider] = [];
    window.currentData[provider].push(value);

    await saveAdminUsers();
    input.value = '';
    renderAdminUsers(window.currentData);
}

export async function removeAdminUser(provider, index) {
    console.log(`Attempting to remove user: provider=${provider}, index=${index}`);
    try {
        if (!window.currentData) {
            console.error('currentData is null or undefined');
            alert('Error: Data not loaded. Please refresh.');
            return;
        }
        if (!window.currentData[provider]) {
            console.error(`Provider ${provider} not found in currentData`, window.currentData);
            window.currentData[provider] = [];
        }

        if (index < 0 || index >= window.currentData[provider].length) {
            console.error(`Invalid index ${index} for provider ${provider}`);
            alert('Error: Invalid user index.');
            return;
        }

        window.currentData[provider].splice(index, 1);
        console.log('User removed from local state. Saving...', window.currentData);
        await saveAdminUsers();
        renderAdminUsers(window.currentData);
    } catch (e) {
        console.error('Error in removeAdminUser:', e);
        alert('An error occurred while trying to remove the user.');
    }
}

export async function saveAdminUsers() {
    console.log('Saving admin users:', window.currentData);
    try {
        const response = await fetch('/admin/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to save users:', response.status, errorText);
            alert('Failed to save changes: ' + response.status);
            // Reload to revert
            switchTab('users');
        } else {
            console.log('Admin users saved successfully.');
            alert('Admin users updated successfully!');
        }
    } catch (error) {
        console.error('Error saving users:', error);
        alert('Error saving changes');
    }
}

// Attach to window
window.addAdminUser = addAdminUser;
window.removeAdminUser = removeAdminUser;
