
// State Management
let state = {
    data: {
        items: {
            enabled: false,
            darkMode: createDefaultGradientConfig('linear'),
            lightMode: createDefaultGradientConfig('radial')
        },
        presets: {}
    },
    currentMode: 'darkMode', // 'darkMode' or 'lightMode'
    selectedStopIndex: 0,
    unsavedChanges: false
};

// Default Configuration Factory
function createDefaultGradientConfig(type = 'linear') {
    return {
        type: type,
        angle: 90,
        centerX: 50,
        centerY: 50,
        spread: 100,
        noise: 0,
        mirror: false,
        repeat: false,
        colorStops: [
            { position: 0, color: '#000000', opacity: 1 },
            { position: 100, color: '#ffffff', opacity: 1 }
        ],
        applyTo: {
            body: true,
            navbar: true
        }
    };
}

// Main Render Function
export function renderAdvancedColors(data) {
    // Initialize state with fetched data or defaults
    if (data && data.items) {
        state.data = JSON.parse(JSON.stringify(data)); // Deep copy
    } else {
        // Fallback if data is empty
        state.data = {
            items: {
                enabled: false,
                darkMode: createDefaultGradientConfig('linear'),
                lightMode: createDefaultGradientConfig('radial')
            },
            presets: {}
        };
    }
    
    // Ensure data integrity
    if (!state.data.presets) state.data.presets = {};
    if (!state.data.items.darkMode) state.data.items.darkMode = createDefaultGradientConfig('linear');
    if (!state.data.items.lightMode) state.data.items.lightMode = createDefaultGradientConfig('radial');

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = generateUI();
    
    attachEventListeners();
    updatePreview();
    renderPresets();
}

// UI Generation
function generateUI() {
    const activeConfig = state.data.items[state.currentMode];
    const isEnabled = state.data.items.enabled;
    const opacityClass = isEnabled ? '' : 'opacity-50 pointer-events-none';

    return `
    <div class="flex flex-col h-full space-y-4">
        <!-- Header & Global Controls -->
        <div class="flex justify-between items-center bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)]">
            <div class="flex items-center space-x-4">
                <h2 class="text-xl font-bold text-[var(--admin-text-primary)]">Advanced Gradient Editor</h2>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-[var(--admin-text-muted)]">Use Advanced Gradients</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="global-enable-toggle" class="sr-only peer" ${state.data.items.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            <div class="flex space-x-2">
                 <div class="flex bg-gray-800 rounded p-1 mr-4">
                    <button id="tab-dark" class="px-4 py-1 rounded text-sm font-medium transition-colors ${state.currentMode === 'darkMode' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}" onclick="window.setMode('darkMode')">Dark Mode</button>
                    <button id="tab-light" class="px-4 py-1 rounded text-sm font-medium transition-colors ${state.currentMode === 'lightMode' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}" onclick="window.setMode('lightMode')">Light Mode</button>
                </div>
                <button onclick="window.revertChanges()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancel</button>
                <button onclick="window.saveAdvancedColors()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold">Save Changes</button>
            </div>
        </div>

        <div class="flex flex-1 overflow-hidden space-x-4 ${opacityClass}" id="main-editor-container">
            <!-- Left Sidebar: Controls -->
            <div class="w-1/3 flex flex-col space-y-4 overflow-y-auto pr-2">
                
                <!-- Gradient Type -->
                <div class="bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)]">
                    <label class="block text-sm font-medium text-gray-400 mb-2">Gradient Type</label>
                    <select id="gradient-type" class="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                        <option value="linear" ${activeConfig.type === 'linear' ? 'selected' : ''}>Linear</option>
                        <option value="radial" ${activeConfig.type === 'radial' ? 'selected' : ''}>Radial</option>
                        <option value="conic" ${activeConfig.type === 'conic' ? 'selected' : ''}>Conic</option>
                    </select>
                </div>

                <!-- Color Stops Editor -->
                <div class="bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)]">
                    <div class="flex justify-between items-center mb-2">
                        <label class="text-sm font-medium text-gray-400">Color Stops</label>
                        <div class="space-x-1">
                            <button onclick="window.addStop()" class="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded">+ Add</button>
                            <button onclick="window.deleteStop()" class="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded trash-icon">Del</button>
                        </div>
                    </div>
                    
                    <!-- Visual Timeline -->
                    <div class="relative h-6 bg-gray-700 rounded mb-4 cursor-pointer" id="stops-timeline">
                        <div class="absolute inset-0 rounded overflow-hidden" id="stops-timeline-preview"></div>
                        <!-- Stops will be injected here -->
                    </div>

                    <!-- Selected Stop Details -->
                    <div class="space-y-3 border-t border-gray-700 pt-3">
                        <div class="text-xs text-gray-500 uppercase tracking-wider mb-2">Selected Stop</div>
                         <div class="flex items-center space-x-2">
                            <label class="text-xs text-gray-400 w-12">Pos %</label>
                            <input type="number" id="stop-position" class="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white" min="0" max="100">
                            <input type="range" id="stop-position-slider" class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" min="0" max="100">
                        </div>
                        <div class="flex items-center space-x-2">
                            <label class="text-xs text-gray-400 w-12">Color</label>
                            <div class="flex items-center space-x-2 flex-1">
                                <input type="color" id="stop-color-picker" class="w-8 h-8 rounded border-0 p-0 bg-transparent cursor-pointer">
                                <input type="text" id="stop-color-text" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white font-mono">
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <label class="text-xs text-gray-400 w-12">Opacity</label>
                            <input type="range" id="stop-opacity" class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" min="0" max="1" step="0.01">
                            <span id="stop-opacity-val" class="text-xs text-gray-400 w-8 text-right">1.0</span>
                        </div>
                    </div>
                </div>

                <!-- Configuration Sliders -->
                <div class="bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)] space-y-4">
                    <label class="text-sm font-medium text-gray-400">Configuration</label>
                    
                    ${renderSlider('Angle (°)', 'config-angle', activeConfig.angle, 0, 360, 1)}
                    ${renderSlider('Center X (%)', 'config-center-x', activeConfig.centerX, 0, 100, 1)}
                    ${renderSlider('Center Y (%)', 'config-center-y', activeConfig.centerY, 0, 100, 1)}
                    ${renderSlider('Spread (%)', 'config-spread', activeConfig.spread, 0, 200, 1)}
                    ${renderSlider('Texture Noise %', 'config-noise', activeConfig.noise, 0, 50, 1)}

                    <div class="flex space-x-4 pt-2">
                         <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="config-mirror" class="rounded bg-gray-700 border-gray-600 text-blue-600" ${activeConfig.mirror ? 'checked' : ''}>
                            <span class="text-sm text-gray-300">Mirror</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="config-repeat" class="rounded bg-gray-700 border-gray-600 text-blue-600" ${activeConfig.repeat ? 'checked' : ''}>
                            <span class="text-sm text-gray-300">Repeat</span>
                        </label>
                    </div>
                </div>

                 <!-- Apply To -->
                <div class="bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)]">
                    <label class="text-sm font-medium text-gray-400 mb-2 block">Apply Gradient To</label>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="apply-body" class="rounded bg-gray-700 border-gray-600 text-blue-600" ${activeConfig.applyTo.body ? 'checked' : ''}>
                            <span class="text-sm text-gray-300">Body / Background</span>
                        </label>
                         <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="apply-navbar" class="rounded bg-gray-700 border-gray-600 text-blue-600" ${activeConfig.applyTo.navbar ? 'checked' : ''}>
                            <span class="text-sm text-gray-300">Navbar</span>
                        </label>
                    </div>
                </div>
                
                <button onclick="window.resetCurrentGradient()" class="w-full py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors text-sm">
                    Reset Gradient to Default
                </button>

                 <!-- Presets -->
                <div class="bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)]">
                     <button class="flex justify-between w-full text-left font-medium text-gray-400" onclick="document.getElementById('preset-content').classList.toggle('hidden')">
                        <span>Preset Management</span>
                        <span>▼</span>
                    </button>
                    <div id="preset-content" class="hidden mt-4 space-y-4">
                        <input type="text" id="preset-name" placeholder="Preset Name" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-xs text-white">
                        <input type="text" id="preset-desc" placeholder="Description" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-xs text-white">
                        <button onclick="window.saveAsPreset()" class="w-full bg-blue-700 hover:bg-blue-600 text-white py-1 rounded text-xs">Save as Preset</button>
                        
                        <div id="presets-list" class="space-y-2 max-h-40 overflow-y-auto">
                            <!-- Presets rendered here -->
                        </div>
                    </div>
                </div>
                
                <!-- JSON Export -->
                 <div class="bg-[var(--admin-bg-secondary)] p-4 rounded-lg border border-[var(--admin-border-primary)]">
                    <button class="flex justify-between w-full text-left font-medium text-gray-400" onclick="document.getElementById('io-content').classList.toggle('hidden')">
                        <span>Import / Export</span>
                        <span>▼</span>
                    </button>
                     <div id="io-content" class="hidden mt-4 space-y-2">
                        <button onclick="window.copyJSON()" class="w-full bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs">Copy JSON to Clipboard</button>
                         <textarea id="import-json-area" class="w-full h-16 bg-gray-800 border-gray-600 text-xs text-gray-300 p-1" placeholder="Paste JSON here..."></textarea>
                        <button onclick="window.importJSON()" class="w-full bg-orange-700 hover:bg-orange-600 text-white py-1 rounded text-xs">Import JSON</button>
                    </div>
                </div>

            </div>

            <!-- Right Panel: Live Preview -->
            <div class="flex-1 bg-gray-900 rounded-lg border border-[var(--admin-border-primary)] relative overflow-hidden flex flex-col">
                <div class="absolute inset-0 bg-gray-800 z-0"></div> <!-- Base BG -->
                <div id="live-preview-bg" class="absolute inset-0 z-10 transition-all duration-300"></div> <!-- Gradient Layer -->
                
                <!-- Mock UI -->
                <div class="relative z-20 flex flex-col h-full pointer-events-none">
                     <!-- Navbar Mock -->
                    <div id="live-preview-navbar" class="h-16 border-b border-white/10 flex items-center px-8 transition-all duration-300 bg-opacity-20 backdrop-blur-md">
                        <div class="w-8 h-8 rounded-full bg-red-400 mr-4"></div>
                        <div class="h-4 w-24 bg-white/20 rounded"></div>
                        <div class="flex-1"></div>
                        <div class="flex space-x-4">
                             <div class="h-4 w-16 bg-white/10 rounded"></div>
                             <div class="h-4 w-16 bg-white/10 rounded"></div>
                             <div class="h-4 w-16 bg-white/10 rounded"></div>
                        </div>
                    </div>

                    <!-- Body Content Mock -->
                    <div class="flex-1 p-12 space-y-8 overflow-y-auto">
                        <div class="h-64 bg-white/5 rounded-2xl p-8 space-y-4 border border-white/10 backdrop-blur-sm">
                             <div class="h-8 w-1/2 bg-white/20 rounded"></div>
                             <div class="h-4 w-3/4 bg-white/10 rounded"></div>
                             <div class="h-4 w-full bg-white/10 rounded"></div>
                             <div class="h-4 w-5/6 bg-white/10 rounded"></div>
                             
                             <div class="pt-8 flex space-x-4">
                                <div class="h-10 w-32 bg-yellow-400/80 rounded-lg"></div>
                                <div class="h-10 w-32 bg-white/10 rounded-lg"></div>
                             </div>
                        </div>

                         <div class="grid grid-cols-2 gap-8">
                             <div class="h-40 bg-white/5 rounded-xl border border-white/10"></div>
                             <div class="h-40 bg-white/5 rounded-xl border border-white/10"></div>
                        </div>
                        
                        <div class="flex space-x-2 mt-8">
                             <div class="px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 text-xs border border-pink-500/30">Chip</div>
                             <div class="px-3 py-1 rounded-full bg-orange-500/20 text-orange-200 text-xs border border-orange-500/30">Another Chip</div>
                             <div class="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-xs border border-yellow-500/30">Tag</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function renderSlider(label, id, value, min, max, step) {
    return `
    <div class="space-y-1">
        <div class="flex justify-between">
            <label class="text-xs text-gray-400">${label}</label>
            <span id="${id}-val" class="text-xs text-gray-400 font-mono">${value}</span>
        </div>
        <input type="range" id="${id}" value="${value}" min="${min}" max="${max}" step="${step}" 
            class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer">
    </div>
    `;
}

function attachEventListeners() {
    // Global Toggle
    document.getElementById('global-enable-toggle').addEventListener('change', (e) => {
        state.data.items.enabled = e.target.checked;
        const mainContainer = document.getElementById('main-editor-container');
        if (state.data.items.enabled) {
            mainContainer.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            mainContainer.classList.add('opacity-50', 'pointer-events-none');
        }
    });

    // Inputs
    bindInput('gradient-type', 'type');
    bindConfigSlider('config-angle', 'angle');
    bindConfigSlider('config-center-x', 'centerX');
    bindConfigSlider('config-center-y', 'centerY');
    bindConfigSlider('config-spread', 'spread');
    bindConfigSlider('config-noise', 'noise');
    
    bindCheckbox('config-mirror', 'mirror');
    bindCheckbox('config-repeat', 'repeat');
    bindCheckbox('apply-body', 'applyTo.body');
    bindCheckbox('apply-navbar', 'applyTo.navbar');

    // Stop Editor Events
    document.getElementById('stop-position-slider').addEventListener('input', (e) => {
        updateSelectedStop('position', parseInt(e.target.value));
    });
    document.getElementById('stop-position').addEventListener('input', (e) => {
        updateSelectedStop('position', parseInt(e.target.value));
    });
    document.getElementById('stop-opacity').addEventListener('input', (e) => {
        updateSelectedStop('opacity', parseFloat(e.target.value));
    });
    document.getElementById('stop-color-picker').addEventListener('input', (e) => {
        // Picker returns hex without alpha, needs integration
        syncStopColor(e.target.value, true);
    });
    document.getElementById('stop-color-text').addEventListener('input', (e) => {
        syncStopColor(e.target.value, false);
    });

    renderStopsTimeline();
}

function bindInput(id, key) {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('change', (e) => {
            const config = state.data.items[state.currentMode];
            config[key] = e.target.value;
            updatePreview();
        });
    }
}

function bindConfigSlider(id, key) {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById(`${id}-val`).innerText = val;
            state.data.items[state.currentMode][key] = val;
            updatePreview();
        });
    }
}

function bindCheckbox(id, keyPath) {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('change', (e) => {
            const config = state.data.items[state.currentMode];
            if (keyPath.includes('.')) {
                const [p, k] = keyPath.split('.');
                config[p][k] = e.target.checked;
            } else {
                config[keyPath] = e.target.checked;
            }
            updatePreview();
        });
    }
}

// Logic Functions

window.setMode = (mode) => {
    state.currentMode = mode;
    state.selectedStopIndex = 0; // Reset selection
    renderAdvancedColors(state.data); // Re-render with new mode
};

window.revertChanges = () => {
    if(confirm("Discard unsaved changes?")) {
        // Ideally reload from server
        window.switchTab('advanced_colors');
    }
};

window.saveAdvancedColors = () => {
    // Construct payload
    const payload = state.data; // Structure matches requirement
    const btn = document.querySelector('button[onclick="window.saveAdvancedColors()"]');
    // Using global API generic handler if available, else manual fetch
    // Calling dashboard.js's handleSave with manual payload string
    // But handleSave expects eventOrSection.
    
    // We can directly use fetch here for precision
    fetch('/admin/api/data/advanced_colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if(res.ok) alert('Saved successfully!');
        else alert('Error saving.');
    })
    .catch(err => alert('Error: ' + err));
};

window.addStop = () => {
    const config = state.data.items[state.currentMode];
    // Add stop at 50% or near selected
    const newStop = { position: 50, color: '#888888', opacity: 1 };
    config.colorStops.push(newStop);
    config.colorStops.sort((a,b) => a.position - b.position);
    renderStopsTimeline();
    updatePreview();
};

window.deleteStop = () => {
    const config = state.data.items[state.currentMode];
    if (config.colorStops.length <= 2) {
        alert("Minimum 2 stops required.");
        return;
    }
    config.colorStops.splice(state.selectedStopIndex, 1);
    state.selectedStopIndex = Math.max(0, state.selectedStopIndex - 1);
    renderStopsTimeline();
    updatePreview();
};

window.resetCurrentGradient = () => {
    if(confirm("Reset this gradient to default?")) {
        state.data.items[state.currentMode] = createDefaultGradientConfig(state.currentMode === 'lightMode' ? 'radial' : 'linear');
        state.selectedStopIndex = 0;
        renderAdvancedColors(state.data);
    }
};

// Stops Logic
function renderStopsTimeline() {
    const config = state.data.items[state.currentMode];
    const timeline = document.getElementById('stops-timeline');
    const preview = document.getElementById('stops-timeline-preview');
    
    // Clean old markers
    const markers = timeline.querySelectorAll('.stop-marker');
    markers.forEach(m => m.remove());

    // Update background preview
    const gradientCss = generateCssGradientForTimeline(config);
    preview.style.background = gradientCss;

    // Render Markers
    config.colorStops.forEach((stop, index) => {
        const marker = document.createElement('div');
        marker.className = `stop-marker absolute w-4 h-6 -top-1 bg-white border-2 border-gray-600 rounded cursor-grab shadow-sm transform -translate-x-1/2 hover:scale-110 transition-transform ${index === state.selectedStopIndex ? 'border-blue-500 z-20' : 'z-10'}`;
        marker.style.left = `${stop.position}%`;
        marker.style.backgroundColor = stop.color;
        
        marker.onclick = (e) => {
            e.stopPropagation();
            selectStop(index);
        };
        
        timeline.appendChild(marker);
    });

    updateSelectedStopInputs();
}

function selectStop(index) {
    state.selectedStopIndex = index;
    renderStopsTimeline(); // Re-render to update highlights
}

function updateSelectedStopInputs() {
    const config = state.data.items[state.currentMode];
    const stop = config.colorStops[state.selectedStopIndex];
    if(!stop) return;

    document.getElementById('stop-position').value = stop.position;
    document.getElementById('stop-position-slider').value = stop.position;
    document.getElementById('stop-opacity').value = stop.opacity;
    document.getElementById('stop-opacity-val').innerText = stop.opacity;
    document.getElementById('stop-color-text').value = stop.color;
    document.getElementById('stop-color-picker').value = stop.color.substring(0, 7);
}

function updateSelectedStop(key, value) {
    const config = state.data.items[state.currentMode];
    const stop = config.colorStops[state.selectedStopIndex];
    if(!stop) return;

    stop[key] = value;
    
    if (key === 'position') {
        // Keep sorted? Or just allow free movement.
        // Usually better to sort, but might jump UI.
        // Let's NOT sort automatically while dragging, only on render or specific action.
        // But updating timeline needs correct pos.
        // Just clamp 0-100
        stop.position = Math.max(0, Math.min(100, stop.position));
    }
    
    // Update UI Elements directly
    if (key === 'position') {
        document.getElementById('stop-position').value = stop.position;
        document.getElementById('stop-position-slider').value = stop.position;
        renderStopsTimeline(); // Move marker
    }
    if (key === 'opacity') {
        document.getElementById('stop-opacity-val').innerText = stop.opacity;
        updatePreview();
    }
    
    updatePreview();
}

function syncStopColor(val, fromPicker) {
    const config = state.data.items[state.currentMode];
    const stop = config.colorStops[state.selectedStopIndex];
    
    if (fromPicker) {
        stop.color = val; // Hex from picker
        document.getElementById('stop-color-text').value = val;
    } else {
        stop.color = val;
        // Verify valid hex before updating picker
        if (val.startsWith('#') && val.length === 7) {
            document.getElementById('stop-color-picker').value = val;
        }
    }
    renderStopsTimeline(); // Update marker color
    updatePreview();
}

// Utils
function generateCssGradientForTimeline(config) {
    // Always linear right for timeline
    const stopStr = config.colorStops
        .sort((a,b) => a.position - b.position)
        .map(s => `${s.color} ${s.position}%`)
        .join(', ');
    return `linear-gradient(to right, ${stopStr})`;
}

function updatePreview() {
    const config = state.data.items[state.currentMode];
    const previewBg = document.getElementById('live-preview-bg');
    const previewNav = document.getElementById('live-preview-navbar');
    
    if (!previewBg) return;

    // Generate gradient string
    let css = '';
    const stops = [...config.colorStops].sort((a,b) => a.position - b.position);
    const stopStr = stops.map(s => {
        // Handle opacity if needed, converting hex to rgba?
        // Assuming s.color is hex.
        const c = s.color; // simplified
        // If s.opacity < 1, need conversion function.
        // For now using hex directly.
        // Ideally:
        return `${hexToRgba(c, s.opacity)} ${s.position}%`;
    }).join(', ');

    if (config.type === 'linear') {
        css = `linear-gradient(${config.angle}deg, ${stopStr})`;
    } else if (config.type === 'radial') {
        css = `radial-gradient(circle at ${config.centerX}% ${config.centerY}%, ${stopStr})`;
    } else if (config.type === 'conic') {
        css = `conic-gradient(from ${config.angle}deg at ${config.centerX}% ${config.centerY}%, ${stopStr})`;
    }

    if (config.repeat) {
        // Repeat logic modifies function name? CSS: repeating-linear-gradient
        css = css.replace('gradient', 'repeating-gradient').replace('radial-', 'repeating-radial-').replace('linear-', 'repeating-linear-').replace('conic-', 'repeating-conic-');
    }

    previewBg.style.background = css;

    // Apply specific element previews
    if (config.applyTo.navbar) {
        previewNav.style.background = css;
    } else {
        previewNav.style.background = 'rgba(255, 255, 255, 0.1)';
    }

    // Mirror logic?
    if (config.mirror) {
        previewBg.style.transform = 'scaleX(-1)'; // specific usage
    } else {
        previewBg.style.transform = 'none';
    }

    // Noise?
    // Can simulate noise with an overlay or CSS filter.
    // previewBg.style.filter = `contrast(${100 + config.noise}%) brightness(${100 + config.noise}%)`; // Placeholder
}

function hexToRgba(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Presets
function renderPresets() {
    const container = document.getElementById('presets-list');
    if (!container) return;
    
    container.innerHTML = '';
    const presets = state.data.presets || {};
    
    Object.keys(presets).forEach(id => {
        const p = presets[id];
        const el = document.createElement('div');
        el.className = "bg-gray-800 p-2 rounded border border-gray-600 flex justify-between items-center";
        
        // Mini preview
        const gradient = p.gradient; // config object
        const stops = gradient.colorStops.map(s => s.color).join(', ');
        const miniStyle = `background: linear-gradient(to right, ${stops});`;
        
        el.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full border border-gray-500" style="${miniStyle}"></div>
                <div>
                    <div class="text-xs font-bold text-gray-200">${p.name}</div>
                    <div class="text-[10px] text-gray-500">${p.description}</div>
                </div>
            </div>
            <div class="flex space-x-1">
                <button onclick="window.applyPreset('${id}')" class="text-[10px] bg-blue-900 text-blue-200 px-1 rounded">Load</button>
                <button onclick="window.deletePreset('${id}')" class="text-[10px] bg-red-900 text-red-200 px-1 rounded">X</button>
            </div>
        `;
        container.appendChild(el);
    });
}

window.saveAsPreset = () => {
    const name = document.getElementById('preset-name').value;
    const desc = document.getElementById('preset-desc').value;
    if(!name) return alert("Name required");
    
    const id = Date.now().toString(); // Simple ID
    state.data.presets[id] = {
        id: id,
        name: name,
        description: desc,
        gradient: JSON.parse(JSON.stringify(state.data.items[state.currentMode]))
    };
    renderPresets();
};

window.applyPreset = (id) => {
    const preset = state.data.presets[id];
    if(preset) {
        state.data.items[state.currentMode] = JSON.parse(JSON.stringify(preset.gradient));
        state.selectedStopIndex = 0;
        renderAdvancedColors(state.data);
    }
};

window.deletePreset = (id) => {
    if(confirm("Delete preset?")) {
        delete state.data.presets[id];
        renderPresets();
    }
};

window.copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(state.data, null, 2));
    alert("JSON copied!");
};

window.importJSON = () => {
    try {
        const json = document.getElementById('import-json-area').value;
        const parsed = JSON.parse(json);
        state.data = parsed;
        renderAdvancedColors(state.data);
        alert("Imported successfully!");
    } catch(e) {
        alert("Invalid JSON");
    }
};

