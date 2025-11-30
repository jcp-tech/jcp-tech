export function renderCRM(data) {
    const contentArea = document.getElementById('content-area');
    // Store original data for filtering
    window.crmData = Array.isArray(data) ? data : [];
    
    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white">CRM - Contact Requests</h2>
            <div class="relative">
                <input 
                    type="text" 
                    id="crm-search" 
                    placeholder="Search name, email, status..." 
                    class="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 w-64"
                    onkeyup="filterCRM(this.value)"
                >
                <span class="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 text-sm">search</span>
            </div>
        </div>
        <div id="crm-list" class="space-y-4 max-w-4xl">
            <!-- Items will be rendered here -->
        </div>
    `;

    renderCRMList(window.crmData);
}

function getStatusColor(status) {
    switch (status) {
        case 'Added': return 'bg-red-900 text-red-200 border-red-700';
        case 'Received': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
        case 'Contacted': return 'bg-green-900 text-green-200 border-green-700';
        case 'Closed': return 'bg-gray-600 text-gray-200 border-gray-500';
        default: return 'bg-gray-700 text-white border-gray-600';
    }
}

function renderCRMList(items) {
    const listContainer = document.getElementById('crm-list');
    
    if (items.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-400">No contact requests found.</p>';
        return;
    }

    listContainer.innerHTML = items.map(item => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col space-y-2 relative group">
            <button 
                onclick="deleteCRMItem('${item.id}')"
                class="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Request"
            >
                <span class="material-symbols-outlined text-xl">delete</span>
            </button>
            <div class="flex justify-between items-start pr-8">
                <div>
                    <h3 class="text-lg font-bold text-white">${item.name}</h3>
                    <p class="text-sm text-gray-400">${item.email}</p>
                </div>
                <span class="text-xs text-gray-500">${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
            </div>
            <p class="text-gray-300 bg-gray-700 p-2 rounded text-sm">${item.message}</p>
            <div class="flex items-center space-x-2 mt-2">
                <label class="text-xs text-gray-500">Status:</label>
                <select 
                    onchange="updateCRMStatus('${item.id}', this.value, this)" 
                    class="border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 transition-colors ${getStatusColor(item.status)}"
                >
                    <option value="Added" ${item.status === 'Added' ? 'selected' : ''} class="bg-gray-800 text-white">Added</option>
                    <option value="Received" ${item.status === 'Received' ? 'selected' : ''} class="bg-gray-800 text-white">Received</option>
                    <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''} class="bg-gray-800 text-white">Contacted</option>
                    <option value="Closed" ${item.status === 'Closed' ? 'selected' : ''} class="bg-gray-800 text-white">Closed</option>
                </select>
            </div>
        </div>
    `).join('');
}

export function filterCRM(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = window.crmData.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.email.toLowerCase().includes(lowerQuery) ||
        item.message.toLowerCase().includes(lowerQuery) ||
        (item.status && item.status.toLowerCase().includes(lowerQuery))
    );
    renderCRMList(filtered);
}

export async function deleteCRMItem(id) {
    if (!confirm('Are you sure you want to delete this contact request? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/admin/api/crm/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Remove from local data
            window.crmData = window.crmData.filter(item => item.id !== id);
            // Re-render list (respecting current filter if any)
            const searchInput = document.getElementById('crm-search');
            if (searchInput && searchInput.value) {
                filterCRM(searchInput.value);
            } else {
                renderCRMList(window.crmData);
            }
        } else {
            alert('Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        alert('Error deleting request');
    }
}

export async function updateCRMStatus(id, status, selectElement) {
    // Optimistic UI update
    if (selectElement) {
        selectElement.className = `border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 transition-colors ${getStatusColor(status)}`;
    }

    try {
        const response = await fetch('/admin/api/crm/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        
        if (response.ok) {
            // Update local data to keep search in sync
            const item = window.crmData.find(i => i.id === id);
            if (item) item.status = status;
        } else {
            alert('Failed to update status');
            // Revert on failure (optional, but good practice)
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
    }
}

// Attach to window
window.updateCRMStatus = updateCRMStatus;
window.filterCRM = filterCRM;
window.deleteCRMItem = deleteCRMItem;
