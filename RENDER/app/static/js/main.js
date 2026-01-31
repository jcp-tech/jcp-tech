// Main JS Logic
console.log("FastAPI Portfolio Loaded");

// Theme Toggle Logic
const toggleTheme = () => {
  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
  updateThemeIcon();
};

const updateThemeIcon = () => {
  const isDark = document.documentElement.classList.contains("dark");
  const themeBtnIcon = document.querySelector("#theme-toggle-btn span");
  if (themeBtnIcon) {
    themeBtnIcon.textContent = isDark ? "light_mode" : "dark_mode"; // Icon shows what you switch TO? No, usually shows current state or action.
    // React code: {isDark ? 'light_mode' : 'dark_mode'}
    // If isDark is true, it shows 'light_mode' (sun) to switch to light.
    // So if dark class is present, show light_mode.
  }
};

// Initialize Theme
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

if (savedTheme === "dark" || !savedTheme) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
updateThemeIcon();

// Mobile Menu Logic
const toggleMenu = () => {
  const menu = document.getElementById("mobile-menu");
  const btnIcon = document.querySelector("#mobile-menu-btn span");
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    if (btnIcon) btnIcon.textContent = "close";
  } else {
    menu.classList.add("hidden");
    if (btnIcon) btnIcon.textContent = "menu";
  }
};

// Scroll To Section
const scrollToSection = (e, href) => {
  e.preventDefault();
  // Close mobile menu if open
  const menu = document.getElementById("mobile-menu");
  if (!menu.classList.contains("hidden")) {
    toggleMenu();
  }

  const element = document.querySelector(href);
  if (element) {
    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

// Scroll Spy Logic
const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight * 0.3;
  let currentSection = "#home";
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  // We need to know the sections. We can get them from the links.
  // Assuming links have data-href or href attribute.
  // In the template I added data-href.

  navLinks.forEach((link) => {
    const href = link.getAttribute("data-href");
    const section = document.querySelector(href);
    if (section) {
      const { offsetTop, offsetHeight } = section;
      if (
        scrollPosition >= offsetTop &&
        scrollPosition < offsetTop + offsetHeight
      ) {
        currentSection = href;
      }
    }
  });

  if (window.scrollY < 100) {
    currentSection = "#home";
  }
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
    currentSection = "#contact";
  }

  // Update Active State
  updateActiveLink(currentSection);
};

const updateActiveLink = (currentSection) => {
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  const updateLink = (link) => {
    const href = link.getAttribute("data-href");
    if (href === currentSection) {
      link.classList.add("text-primary", "font-bold", "shadow-glow-text");
      link.classList.remove(
        "text-gray-600",
        "dark:text-white/80",
        "hover:text-gray-900",
        "dark:hover:text-white"
      );
    } else {
      link.classList.remove("text-primary", "font-bold", "shadow-glow-text");
      link.classList.add(
        "text-gray-600",
        "dark:text-white/80",
        "hover:text-gray-900",
        "dark:hover:text-white"
      );
    }
  };

  navLinks.forEach(updateLink);
  mobileNavLinks.forEach(updateLink);
};

window.addEventListener("scroll", handleScroll);
// Initial check
window.addEventListener("load", () => {
  handleScroll();
  if (document.getElementById("projects-grid")) {
    filterProjects("Featured");
  }
});

// --- HERO TERMINAL LOGIC ---
let isTerminalOpen = false;
let isRunning = false;
let fullOutput = []; // Will be populated from DOM

const loadTerminalOutput = () => {
  const dataElement = document.getElementById("terminal-data");
  if (dataElement) {
    const rawText = dataElement.textContent;
    // Split by newline, but keep empty lines
    fullOutput = rawText.split("\n");

    // Add footer messages
    fullOutput.push("");
    fullOutput.push("...Program finished with exit code 0");
    fullOutput.push("Press ENTER to exit console.");
  } else {
    // Fallback if something goes wrong
    fullOutput = ["Error: Could not load terminal output."];
  }
};

const runCode = () => {
  if (isRunning || isTerminalOpen) return;

  loadTerminalOutput(); // Load latest output
  isRunning = true;
  updateRunButtonState();

  // Slight delay to simulate startup
  setTimeout(() => {
    isTerminalOpen = true;
    isRunning = false;
    updateRunButtonState();
    showTerminalOverlay();
    startTyping();
  }, 600);
};

const updateRunButtonState = () => {
  const btn = document.getElementById("run-code-btn");
  const icon = document.getElementById("run-icon");
  const text = document.getElementById("run-text");

  if (isRunning) {
    btn.classList.remove(
      "bg-green-500/10",
      "text-green-600",
      "dark:text-green-400",
      "hover:bg-green-500/20",
      "hover:shadow-[0_0_10px_rgba(74,222,128,0.3)]",
      "cursor-pointer"
    );
    btn.classList.add("bg-yellow-500/10", "text-yellow-500", "cursor-wait");
    icon.textContent = "progress_activity";
    icon.classList.add("animate-spin");
    text.textContent = "Running...";
  } else {
    btn.classList.add(
      "bg-green-500/10",
      "text-green-600",
      "dark:text-green-400",
      "hover:bg-green-500/20",
      "hover:shadow-[0_0_10px_rgba(74,222,128,0.3)]",
      "cursor-pointer"
    );
    btn.classList.remove("bg-yellow-500/10", "text-yellow-500", "cursor-wait");
    icon.textContent = "play_arrow";
    icon.classList.remove("animate-spin");
    text.textContent = "Run";
  }
};

const showTerminalOverlay = () => {
  const overlay = document.getElementById("terminal-overlay");
  overlay.classList.remove("hidden");
  // Clear previous content except cursor
  const content = document.getElementById("terminal-content");
  content.innerHTML =
    '<div class="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 mt-1"></div>';
};

const startTyping = async () => {
  const content = document.getElementById("terminal-content");
  // Remove cursor temporarily to append lines before it
  // Actually simpler to just append lines and keep cursor at end

  // Clear content first
  content.innerHTML = "";

  for (let i = 0; i < fullOutput.length; i++) {
    await new Promise((r) => setTimeout(r, 400)); // Delay between lines

    const lineDiv = document.createElement("div");
    lineDiv.className = `min-h-[1.5em] ${
      fullOutput[i].includes("Program finished") ||
      fullOutput[i].includes("Press ENTER")
        ? "text-green-400 font-bold"
        : "text-gray-400"
    }`;
    lineDiv.textContent = fullOutput[i];

    content.appendChild(lineDiv);

    // Scroll to bottom
    content.scrollTop = content.scrollHeight;
  }

  // Add cursor at the end
  const cursor = document.createElement("div");
  cursor.className =
    "animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 mt-1";
  content.appendChild(cursor);
};

const closeTerminal = () => {
  isTerminalOpen = false;
  const overlay = document.getElementById("terminal-overlay");
  overlay.classList.add("hidden");
};

// Handle Enter key to close terminal
window.addEventListener("keydown", (e) => {
  if (isTerminalOpen && e.key === "Enter") {
    closeTerminal();
  }
});

// --- PROJECTS FILTER LOGIC ---
// --- PROJECTS FILTER LOGIC ---
const filterProjects = (category) => {
  // Update active button state
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.filter === category) {
      btn.classList.add(
        "bg-primary/10",
        "border-primary",
        "text-primary",
        "font-bold"
      );
      btn.classList.remove(
        "bg-white",
        "dark:bg-white/5",
        "border-gray-200",
        "dark:border-white/10",
        "hover:bg-gray-50",
        "dark:hover:bg-white/10",
        "text-gray-600",
        "dark:text-white/80"
      );
    } else {
      btn.classList.remove(
        "bg-primary/10",
        "border-primary",
        "text-primary",
        "font-bold"
      );
      btn.classList.add(
        "bg-white",
        "dark:bg-white/5",
        "border-gray-200",
        "dark:border-white/10",
        "hover:bg-gray-50",
        "dark:hover:bg-white/10",
        "text-gray-600",
        "dark:text-white/80"
      );
    }
  });

  // Filter grid items
  const projects = document.querySelectorAll(".project-card");
  projects.forEach((project) => {
    let tags = [];
    try {
        tags = JSON.parse(project.dataset.tags || "[]");
    } catch (e) {
        console.error("Error parsing tags", e);
    }
    const isFeatured = project.dataset.featured === "true";
    let shouldShow = false;

    if (category === "Featured") {
      if (isFeatured) shouldShow = true;
    } else {
      if (project.dataset.category === category) {
        shouldShow = true;
      }
    }

    if (shouldShow) {
        project.classList.remove("hidden");
        project.classList.add("flex");
    } else {
        project.classList.add("hidden");
        project.classList.remove("flex");
    }
  });
};

// --- EXPERIENCE TABS LOGIC ---
const switchExperience = (expId) => {
  // Update active button state
  const buttons = document.querySelectorAll(".exp-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.id === expId) {
      btn.classList.add(
        "bg-gradient-to-r",
        "from-primary/10",
        "to-transparent"
      );
      btn.classList.remove("hover:bg-gray-100", "dark:hover:bg-white/5");

      // Show active indicator line
      const indicator = btn.querySelector(".active-indicator");
      if (indicator) indicator.classList.remove("hidden");

      // Update text color
      const textSpan = btn.querySelector(".exp-company");
      textSpan.classList.add("text-primary");
      textSpan.classList.remove(
        "text-gray-500",
        "dark:text-white/60",
        "group-hover:text-gray-900",
        "dark:group-hover:text-white"
      );

      // Show "View Timeline" text
      const viewText = btn.querySelector(".view-timeline");
      if (viewText) viewText.classList.remove("hidden");
    } else {
      btn.classList.remove(
        "bg-gradient-to-r",
        "from-primary/10",
        "to-transparent"
      );
      btn.classList.add("hover:bg-gray-100", "dark:hover:bg-white/5");

      // Hide active indicator line
      const indicator = btn.querySelector(".active-indicator");
      if (indicator) indicator.classList.add("hidden");

      // Update text color
      const textSpan = btn.querySelector(".exp-company");
      textSpan.classList.remove("text-primary");
      textSpan.classList.add(
        "text-gray-500",
        "dark:text-white/60",
        "group-hover:text-gray-900",
        "dark:group-hover:text-white"
      );

      // Hide "View Timeline" text
      const viewText = btn.querySelector(".view-timeline");
      if (viewText) viewText.classList.add("hidden");
    }
  });

  // Show selected experience content
  const contents = document.querySelectorAll(".exp-content");
  contents.forEach((content) => {
    if (content.id === `exp-${expId}`) {
      content.classList.remove("hidden");
      content.classList.add("fade-in-anim");
    } else {
      content.classList.add("hidden");
      content.classList.remove("fade-in-anim");
    }
  });
};

// --- SKILLS TABS LOGIC ---
const switchSkillCategory = (category) => {
  // Update active button state
  const buttons = document.querySelectorAll(".skill-tab-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.category === category) {
      // btn.classList.add('border-b-primary', 'text-primary', 'dark:text-white');
      // btn.classList.remove('border-b-transparent', 'text-gray-500', 'dark:text-white/60', 'hover:text-gray-900', 'dark:hover:text-white');
      btn.classList.add(
        "bg-primary",
        "text-white",
        "shadow-lg",
        "shadow-primary/25",
        "scale-105"
      );
      btn.classList.remove(
        "bg-gray-100",
        "dark:bg-white/5",
        "text-gray-600",
        "dark:text-white/60",
        "hover:bg-gray-200",
        "dark:hover:bg-white/10",
        "hover:text-gray-900",
        "dark:hover:text-white"
      );
    } else {
      // btn.classList.remove('border-b-primary', 'text-primary', 'dark:text-white');
      // btn.classList.add('border-b-transparent', 'text-gray-500', 'dark:text-white/60', 'hover:text-gray-900', 'dark:hover:text-white');
      btn.classList.remove(
        "bg-primary",
        "text-white",
        "shadow-lg",
        "shadow-primary/25",
        "scale-105"
      );
      btn.classList.add(
        "bg-gray-100",
        "dark:bg-white/5",
        "text-gray-600",
        "dark:text-white/60",
        "hover:bg-gray-200",
        "dark:hover:bg-white/10",
        "hover:text-gray-900",
        "dark:hover:text-white"
      );
    }
  });

  // Filter grid items
  const skills = document.querySelectorAll(".skill-card");
  skills.forEach((skill) => {
    if (skill.dataset.skillCategory === category) {
      skill.classList.remove("hidden");
      // Add animation
      skill.classList.remove("animate-in", "fade-in", "zoom-in-95");
      void skill.offsetWidth; // trigger reflow
      skill.classList.add(
        "animate-in",
        "fade-in",
        "zoom-in-95",
        "duration-300"
      );
    } else {
      skill.classList.add("hidden");
    }
  });
};
