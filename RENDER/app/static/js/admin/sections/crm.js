export function renderCRM(data) {
    const contentArea = document.getElementById('content-area');
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map(item => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col space-y-2">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-bold text-white">${item.name}</h3>
                    <p class="text-sm text-gray-400">${item.email}</p>
                </div>
                <span class="text-xs text-gray-500">${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
            </div>
            <p class="text-gray-300 bg-gray-700 p-2 rounded text-sm">${item.message}</p>
            <div class="flex items-center space-x-2 mt-2">
                <label class="text-xs text-gray-500">Status:</label>
                <select onchange="updateCRMStatus('${item.id}', this.value)" class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Added" ${item.status === 'Added' ? 'selected' : ''}>Added</option>
                    <option value="Received" ${item.status === 'Received' ? 'selected' : ''}>Received</option>
                    <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="Closed" ${item.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-6">CRM - Contact Requests</h2>
        <div class="space-y-4 max-w-4xl">
            ${itemsHtml.length > 0 ? itemsHtml : '<p class="text-gray-400">No contact requests found.</p>'}
        </div>
    `;
}

export async function updateCRMStatus(id, status) {
    try {
        const response = await fetch('/admin/api/crm/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        if (response.ok) {
            // Optional: show toast
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
    }
}

// Attach to window
window.updateCRMStatus = updateCRMStatus;
