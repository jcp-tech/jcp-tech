# Advanced Colors Admin UI — Page Specification for Canvas

## Page Title

**Advanced Gradient Editor**
Section within `/admin` under **Advanced Colors**.

---

## Global Controls (Top Section)

* Toggle Switch: **Use Advanced Gradients** (iOS‑style switch)

  * If OFF → Both Light & Dark gradient editors disabled and "Default Theme Colors" are used.
  * If ON → Selected gradient mode (Light or Dark) becomes active.

* Mode Switch (Two Tabs): **Dark Mode Gradient** | **Light Mode Gradient**

  * Switches editor’s context but preserves data separately for each.
  * Presets can be applied to either or both.

* Buttons: **Cancel** (left) and **Save Changes** (right)

  * Cancel discards and reloads from Firestore.
  * Save validates JSON and commits to Firestore under `PORTFOLIO/ADVANCED_COLORS`.

---

## Gradient Editor Panel (Left Control Sidebar)

### Gradient Type (Dropdown)

**Values:**

* Linear → Straight line blend between color stops.
* Radial → Circular/elliptical gradient radiating outward from center.
* Conic (Angular) → Spins around center like a wheel.
* Mesh (Future Support - disabled initially) → Multi‑point soft grid blending.

**Function:** Determines the mathematical rendering path of the gradient.

### Color Stops Editor

* Horizontal timeline-slider showing all gradient stops.
* Drag color stops left/right to adjust `position` (0–100%).
* Click a stop to select.
* **Add Stop (+)** → Inserts new stop at current slider pointer.
* **Delete Stop (trash icon)** → Removes selected color stop.

#### Selected Stop Editor

* **Color Picker** → Full HSV/RGB/HEX panel.
* **HEX Text Input** → Direct hex entry, auto validates.
* **Opacity Slider** → Controls transparency (0–100%).

**Function:** Defines pigments, transparency and placement in the gradient map.

> NOTE: Similar to the Other Color Sections this needs a Possibility to have RGBA also and not just the RGB HEX.

### Configuration Sliders

(All sliders visually update preview in real time)

* **Angle (°)** → (Linear/Conic only ~ basically will be disabled in the other instances)

  * Adjusts the angle of direction of gradient.
  * Presets: 0°/45°/90°/135°/180°.

* **Center X (%)** → Horizontal gradient anchor point.

* **Center Y (%)** → Vertical gradient anchor point.

* **Spread (%)** → How much the gradient expands outward.

* **Texture Noise %** → Adds film‑grain texture for premium feel.

* Angle (slider)

* Center X (slider, %)

* Center Y (slider, %)

* Spread (slider)

* Texture Noise % (slider)

### Toggle Options

* Mirror (checkbox)
* Repeat (checkbox)

### Reset

* Button: **Reset Gradient to Default | basically RESETS to Plain Background Color.**

---

## Live Preview Display (Right Panel)

* Full-height live gradient preview
* Shows Navbar preview with applied gradient if selected
* Shows Body/Background preview if selected
* Real-time update on color stop movement
* Visual mock UI elements to preview fades and contrast

---

## Preset Management

* Collapsible panel
* Input: Preset Name
* Input: Preset Description
* Button: **Save as Preset**
* List of Preset Cards:

  * Name
  * Description subtitle
  * Actions: Apply Dark / Apply Light / Apply Both / Delete / Rename / Export JSON

---

## Export / Import (Collapsible)

* Button: Copy JSON
* Button: Export JSON File
* Button: Import JSON File

---

## Apply Gradient Settings

(Apply to selected mode — Light or Dark)

* Body / Background
* Navbar
* Both

---

## DATA FORMAT

Stored in Firestore at: `PORTFOLIO / ADVANCED_COLORS`

### Active Theme and Settings

```
"items":{
  "enabled": true,

  "darkMode": {
    "type": "linear",
    "angle": 125,
    "centerX": 50,
    "centerY": 50,
    "spread": 90,
    "noise": 0,
    "mirror": false,
    "repeat": false,

    "colorStops": [
      { "position": 0, "color": "#111111", "opacity": 1 },
      { "position": 100, "color": "#004755", "opacity": 1 }
    ],

    "applyTo": {
      "body": false,
      "navbar": true
    }
  },

  "lightMode": {
    "type": "radial",
    "angle": 90,
    "centerX": 40,
    "centerY": 60,
    "spread": 75,
    "noise": 5,
    "mirror": false,
    "repeat": false,

    "colorStops": [
      { "position": 0, "color": "#FFFFFF", "opacity": 1 },
      { "position": 100, "color": "#C7FAFF", "opacity": 1 }
    ],

    "applyTo": {
      "body": true,
      "navbar": false
    }
  }
}
```

### Preset Format

````
"presets":{
  "id": "uuid",
  "name": "Ocean Split Glow",
  "description": "Blue–Purple smooth transition center biased",

  "gradient": {
    "type": "radial",                       
    "angle": 135,                           
    "centerX": 48,                          
    "centerY": 62,                          
    "spread": 100,                          
    "noise": 0,                             
    "mirror": false,                        
    "repeat": false,                        

    "colorStops": [
      { "position": 0, "color": "#0000FF", "opacity": 1 },
      { "position": 50, "color": "#9B30FF", "opacity": 0.85 },
      { "position": 100, "color": "#FFFFFF", "opacity": 1 }
    ]
  }
}

````