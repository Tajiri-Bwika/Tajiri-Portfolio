const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href");

    if (!targetId || !targetId.startsWith("#")) {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

const themeToggle = document.getElementById("theme-toggle");
const storedTheme = localStorage.getItem("portfolio-theme");

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }
}

if (storedTheme) {
  applyTheme(storedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    localStorage.setItem("portfolio-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  reveals.forEach(section => revealObserver.observe(section));
} else {
  reveals.forEach(section => section.classList.add("active"));
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach(item => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach(card => {
      const categories = (card.dataset.category || "").split(" ");
      const shouldShow = filter === "all" || categories.includes(filter);
      card.hidden = !shouldShow;
    });
  });
});

(function initCommandPalette() {
  const commandPalette = document.getElementById("command-palette");
  const commandSearch = document.getElementById("command-search");
  const commandClose = document.getElementById("command-close");
  const commandTriggers = document.querySelectorAll("#command-open, [data-command-open]");
  const commandItems = document.querySelectorAll(".command-item");

  if (!commandPalette || !commandSearch || !commandClose || commandTriggers.length === 0) {
    return;
  }

  function setTriggerState(isOpen) {
    commandTriggers.forEach(trigger => {
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function openCommandPalette() {
    commandPalette.hidden = false;
    setTriggerState(true);
    commandSearch.value = "";
    filterCommandItems("");
    window.setTimeout(() => commandSearch.focus(), prefersReducedMotion ? 0 : 80);
  }

  function closeCommandPalette() {
    commandPalette.hidden = true;
    setTriggerState(false);
  }

  function filterCommandItems(query) {
    const normalizedQuery = query.trim().toLowerCase();

    commandItems.forEach(item => {
      const text = `${item.textContent || ""} ${item.dataset.commandKeywords || ""}`.toLowerCase();
      item.hidden = normalizedQuery !== "" && !text.includes(normalizedQuery);
    });
  }

  commandTriggers.forEach(trigger => {
    trigger.addEventListener("click", openCommandPalette);
  });

  commandClose.addEventListener("click", closeCommandPalette);

  commandPalette.addEventListener("click", event => {
    if (event.target === commandPalette) {
      closeCommandPalette();
    }
  });

  commandSearch.addEventListener("input", event => {
    filterCommandItems(event.target.value);
  });

  commandItems.forEach(item => {
    item.addEventListener("click", event => {
      const action = item.dataset.commandAction;
      const href = item.getAttribute("href");

      if (action === "assistant") {
        event.preventDefault();
        closeCommandPalette();
        document.getElementById("chatbot-button")?.click();
        return;
      }

      if (href && href.startsWith("#")) {
        event.preventDefault();
        closeCommandPalette();
        document.querySelector(href)?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
      } else {
        closeCommandPalette();
      }
    });
  });

  document.addEventListener("keydown", event => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;

    if (event.key === "Escape" && !commandPalette.hidden) {
      closeCommandPalette();
      return;
    }

    if (event.key.toLowerCase() === "k" && !isTyping && commandPalette.hidden) {
      event.preventDefault();
      openCommandPalette();
    }
  });
})();

(function initChatbot() {
  const chatbotButton = document.getElementById("chatbot-button");
  const chatbotModal = document.getElementById("chatbot-modal");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotForm = document.getElementById("chatbot-form");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const suggestionButtons = document.querySelectorAll("[data-chat-prompt]");

  if (!chatbotButton || !chatbotModal || !chatbotClose || !chatbotForm || !chatbotInput || !chatbotMessages) {
    return;
  }

  const keywordResponses = {
    greetings: {
      keywords: ["hi", "hello", "hey"],
      response: "Hi. I can help you explore Tajiri Hatibu Bwika's portfolio. Ask about projects, skills, experience, education, resume, or contact details."
    },
    about: {
      keywords: ["who", "about", "profile"],
      response: "Tajiri Hatibu Bwika is a Computer Science student specializing in Business Analytics, with work across dashboards, machine learning, fraud detection, customer intelligence, recommendation systems, and business intelligence."
    },
    skills: {
      keywords: ["skill", "tools", "technology", "tech stack"],
      response: "Core skills include Python, R, SQL, Apache Spark, PySpark, Pandas, NumPy, Machine Learning, Tableau, Power BI, Streamlit, Git, GitHub, Pentaho, MySQL, and data visualization."
    },
    projects: {
      keywords: ["project", "portfolio", "work"],
      response: "Featured projects include Crime Against Women Analytics, Fraud Detection System, E-Commerce Customer Intelligence, Data Warehouse ETL Pipeline, Movie Recommendation System, RAG AI Chatbot, Global Health Dashboard, and Sales Forecasting Model."
    },
    fraud: {
      keywords: ["fraud", "spark", "pyspark"],
      response: "The fraud detection project uses Apache Spark, PySpark, and MLlib to identify fraudulent financial transactions through machine learning workflows."
    },
    dashboard: {
      keywords: ["dashboard", "streamlit", "tableau", "visualization"],
      response: "Tajiri Hatibu Bwika builds dashboards with Streamlit and Tableau, including a live crime analytics dashboard and global health analytics reporting."
    },
    experience: {
      keywords: ["experience", "job", "career"],
      response: "Tajiri Hatibu Bwika works with Christon Institutions on email infrastructure and website development, and also freelances in graphic design and social media marketing."
    },
    education: {
      keywords: ["education", "university", "degree"],
      response: "Tajiri Hatibu Bwika is pursuing a Bachelor of Computer Science, majoring in Business Analytics, through INTI International University and Coventry University. Graduation is expected in 2026."
    },
    contact: {
      keywords: ["contact", "email", "hire", "reach"],
      response: "You can contact Tajiri Hatibu Bwika at tajirihatibu72@gmail.com, on GitHub as Tajiri-Bwika, or on LinkedIn as Tajiri Hatibu Bwika."
    },
    resume: {
      keywords: ["resume", "cv"],
      response: "Use the Resume button in the navigation bar to download Tajiri Hatibu Bwika's resume."
    },
    languages: {
      keywords: ["language", "speak"],
      response: "Tajiri Hatibu Bwika speaks English fluently, Swahili natively, Turkish at an intermediate level, and Chinese at a beginner level."
    }
  };

  const fallbackResponse = "I do not have that answer yet. Try asking about Tajiri Hatibu Bwika's skills, projects, experience, education, resume, or contact details.";

  function addMessage(text, isBot = true) {
    const message = document.createElement("div");
    message.className = `chatbot-message ${isBot ? "bot" : "user"}`;
    message.textContent = text;
    chatbotMessages.appendChild(message);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function getBotResponse(userInput) {
    const lowerInput = userInput.toLowerCase();

    for (const data of Object.values(keywordResponses)) {
      if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
        return data.response;
      }
    }

    return fallbackResponse;
  }

  function openChatbot() {
    chatbotModal.classList.add("open");
    chatbotButton.setAttribute("aria-expanded", "true");

    if (chatbotMessages.children.length === 0) {
      addMessage("Hi. Ask me about Tajiri Hatibu Bwika's skills, projects, experience, resume, or contact details.", true);
    }

    chatbotInput.focus();
  }

  function closeChatbot() {
    chatbotModal.classList.remove("open");
    chatbotButton.setAttribute("aria-expanded", "false");
    chatbotButton.focus();
  }

  chatbotButton.addEventListener("click", openChatbot);
  chatbotClose.addEventListener("click", closeChatbot);

  function handleSendMessage() {
    const userMessage = chatbotInput.value.trim();

    if (!userMessage) {
      return;
    }

    addMessage(userMessage, false);
    chatbotInput.value = "";

    window.setTimeout(() => {
      addMessage(getBotResponse(userMessage), true);
    }, prefersReducedMotion ? 0 : 220);
  }

  chatbotForm.addEventListener("submit", event => {
    event.preventDefault();
    handleSendMessage();
  });

  suggestionButtons.forEach(button => {
    button.addEventListener("click", () => {
      chatbotInput.value = button.dataset.chatPrompt || "";
      handleSendMessage();
      chatbotInput.focus();
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && chatbotModal.classList.contains("open")) {
      closeChatbot();
    }
  });
})();
