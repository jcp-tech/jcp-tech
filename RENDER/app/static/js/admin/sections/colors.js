export function renderColorForm(data, section) {
    const contentArea = document.getElementById('content-area');
    const title = section === 'color_config' ? 'Color Configuration' : 'Syntax Colors';
    
    let html = `<h2 class="text-2xl font-bold text-white mb-6">Edit ${title}</h2>`;
    html += `<form id="edit-form" onsubmit="handleSave(event)" class="space-y-8 max-w-4xl">`;
    
    // Recursive rendering
    html += renderColorRecursive(data, []);
    
    html += `
        <div class="pt-4">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                Save Changes
            </button>
        </div>
    </form>`;
    
    contentArea.innerHTML = html;
}

function sortColorConfigKeys(keys) {
    // Define the specific order: general, dark, light, then alphabetically, then admin
    const order = ['general', 'dark', 'light'];
    const adminKey = 'admin';
    
    return keys.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Check if 'a' is in the priority order
        const aIndex = order.indexOf(aLower);
        const bIndex = order.indexOf(bLower);
        
        // If both are in priority order, sort by their position
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        
        // If only 'a' is in priority order, it comes first
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If 'a' is admin, it goes last
        if (aLower === adminKey) return 1;
        if (bLower === adminKey) return -1;
        
        // Otherwise, sort alphabetically
        return aLower.localeCompare(bLower);
    });
}

function renderColorRecursive(data, path) {
    let html = '';
    
    // If it's a dictionary, render a section
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        // Check if it's a leaf node (all values are strings/numbers) or a branch
        const isLeaf = Object.values(data).every(v => typeof v !== 'object');
        
        if (path.length > 0) {
            const title = path[path.length - 1];
            html += `
                <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <div class="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h3 class="text-xl font-semibold text-blue-400 capitalize">${title}</h3>
                        <button type="button" onclick="addColorItem('${path.join('.')}')" class="text-green-500 hover:text-green-400 text-sm font-bold">
                            + Add Color
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="container-${path.join('-')}">
            `;
        } else {
             html += `<div class="space-y-6">`;
        }

        // Sort keys with custom order for top-level COLOR_CONFIG sections
        const keys = Object.keys(data);
        const sortedKeys = path.length === 0 ? sortColorConfigKeys(keys) : keys;

        for (const key of sortedKeys) {
            const value = data[key];
            if (typeof value === 'object' && value !== null) {
                html += renderColorRecursive(value, [...path, key]);
            } else {
                html += renderColorInput(key, value, [...path, key]);
            }
        }

        if (path.length > 0) {
            html += `</div></div>`;
        } else {
            html += `</div>`;
        }
    }
    return html;
}

function renderColorInput(key, value, path) {
    // Try to convert to hex for the picker (must be 6-digit hex)
    let hexValue = '#000000';
    if (typeof value === 'string') {
        if (value.startsWith('#')) {
            hexValue = value.substring(0, 7); // Strip alpha if present for the picker
        }
    }
    
    const inputId = `text-${path.join('-')}`;
    const previewId = `preview-${path.join('-')}`;

    return `
        <div class="flex flex-col space-y-1 group">
            <label class="text-xs text-gray-500 font-mono">${key}</label>
            <div class="flex items-center space-x-2">
                <!-- True Color Preview (Supports Alpha) -->
                <div id="${previewId}" 
                     class="w-8 h-8 rounded border border-gray-600 shadow-sm"
                     style="background-color: ${value};"
                     title="True Color Preview (includes transparency)"></div>

                <!-- Native Picker (Base Color Only) -->
                <input type="color" 
                       value="${hexValue}" 
                       oninput="syncColor(this, '${inputId}', '${previewId}')"
                       class="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0 opacity-50 hover:opacity-100 transition-opacity"
                       title="Pick Base Color">

                <!-- Text Input (Full Value) -->
                <input type="text" 
                       name="${path.join('.')}" 
                       id="${inputId}"
                       value="${value}" 
                       oninput="syncColor(this, null, '${previewId}', true)"
                       class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-blue-500">
            </div>
        </div>
    `;
}

export function syncColor(source, targetId, previewId, isTextSource = false) {
    const preview = document.getElementById(previewId);
    const val = source.value;

    if (isTextSource) {
        // Text -> Preview & Picker
        if (preview) {
             // Ensure preview handles 8-digit hex correctly (CSS supports #RRGGBBAA)
            preview.style.backgroundColor = val;
        }

        // Update picker only if it's a valid hex format (ignoring alpha for picker)
        if (val.startsWith('#') && (val.length === 7 || val.length === 9)) {
            const picker = source.previousElementSibling; // Input type=color is previous sibling
            if (picker && picker.type === 'color') {
                // Always take the first 7 chars (#RRGGBB) for the picker
                picker.value = val.substring(0, 7);
            }
        }
    } else {
        // Picker -> Text & Preview
        const target = document.getElementById(targetId);
        if (target) {
            // If the target currently has an alpha channel, try to preserve it
            const currentVal = target.value;
            if (currentVal.startsWith('#') && currentVal.length === 9) {
                // Extract alpha from current value
                const alpha = currentVal.substring(7);
                target.value = val + alpha;
            } else {
                target.value = val;
            }
        }
        if (preview) preview.style.backgroundColor = target ? target.value : val;
    }
}

export function addColorItem(pathStr) {
    const key = prompt("Enter the name for the new color:");
    if (!key) return;
    
    const containerId = `container-${pathStr.replace(/\./g, '-')}`;
    const container = document.getElementById(containerId);
    
    if (container) {
        const path = pathStr.split('.');
        const newPath = [...path, key];
        const html = renderColorInput(key, "#ffffff", newPath);
        container.insertAdjacentHTML('beforeend', html);
    }
}

// Attach to window
window.syncColor = syncColor;
window.addColorItem = addColorItem;
