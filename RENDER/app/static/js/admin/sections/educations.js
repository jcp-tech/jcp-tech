export function renderEducations(data) {
    const contentArea = document.getElementById('content-area');
    const items = Array.isArray(data) ? data : [];
    
    const itemsHtml = items.map((item, index) => `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">School</label>
                    <input type="text" data-field="school" value="${item.school || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Degree</label>
                    <input type="text" data-field="degree" value="${item.degree || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Location</label>
                    <input type="text" data-field="location" value="${item.location || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Year</label>
                    <input type="text" data-field="year" value="${item.year || ''}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>

                <div class="flex items-end">
                    <div class="flex items-center">
                        <input type="checkbox" data-field="current" ${item.current ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                        <label class="ml-2 text-sm text-gray-400">Current</label>
                    </div>
                </div>
            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white">Edit Educations</h2>
            <button onclick="addEducationItem()" type="button" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">
                + Add Education
            </button>
        </div>
        <form id="edit-form" onsubmit="handleSave(event)" class="space-y-6 max-w-3xl">
            <div id="education-items" class="space-y-4">
                ${itemsHtml}
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </form>
    `;

    Sortable.create(document.getElementById('education-items'), {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'bg-gray-700'
    });
}

export function addEducationItem() {
    const container = document.getElementById('education-items');
    const html = `
        <div class="bg-gray-800 p-4 rounded border border-gray-700 flex items-start space-x-4 group">
            <div class="drag-handle cursor-move text-gray-500 hover:text-white mt-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">School</label>
                    <input type="text" data-field="school" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Degree</label>
                    <input type="text" data-field="degree" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Location</label>
                    <input type="text" data-field="location" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Year</label>
                    <input type="text" data-field="year" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>

                <div class="flex items-end">
                    <div class="flex items-center">
                        <input type="checkbox" data-field="current" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                        <label class="ml-2 text-sm text-gray-400">Current</label>
                    </div>
                </div>
            </div>
            <button type="button" onclick="this.closest('.group').remove()" class="text-red-500 hover:text-red-400 text-sm mt-2">
                Delete
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

// Attach to window
window.addEducationItem = addEducationItem;
