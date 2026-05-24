document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");

    if (targetId.startsWith("#")) {
      e.preventDefault();

      const target = document.querySelector(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  });
});

const toggle = document.getElementById("theme-toggle");

toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

const reveals = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  reveals.forEach(section => {
    const rect = section.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100) {
      section.classList.add("active");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* Chatbot Logic */
(function initChatbot() {
  const chatbotButton = document.getElementById("chatbot-button");
  const chatbotModal = document.getElementById("chatbot-modal");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");

  // Safe checks for chatbot elements
  if (!chatbotButton || !chatbotModal || !chatbotClose || !chatbotInput || !chatbotSend || !chatbotMessages) {
    return;
  }

  // Keyword response mapping
  const keywordResponses = {
    greetings: {
      keywords: ["hi", "hello", "hey"],
      response: "Hi. I'm Tajiri's portfolio assistant. Ask me about her skills, projects, experience, education, resume, or contact details."
    },
    about: {
      keywords: ["who", "about", "profile"],
      response: "Tajiri Bwika is a Computer Science student specializing in Business Analytics. She focuses on data analytics, machine learning, dashboards, fraud detection, customer intelligence, recommendation systems, and business intelligence solutions."
    },
    skills: {
      keywords: ["skill", "tools", "technology", "tech stack"],
      response: "Tajiri's skills include Python, R, SQL, Apache Spark, PySpark, Pandas, NumPy, Machine Learning, Tableau, Power BI, Streamlit, Git, GitHub, Pentaho, MySQL, Flask, and data visualization."
    },
    projects: {
      keywords: ["project", "portfolio", "work"],
      response: "Tajiri's featured projects include Crime Against Women Analytics, Fraud Detection System, E-Commerce Customer Intelligence, Data Warehouse ETL Pipeline, Movie Recommendation System, RAG AI Chatbot, Global Health Dashboard, and Sales Forecasting Model."
    },
    fraud: {
      keywords: ["fraud", "spark", "pyspark"],
      response: "Her fraud detection project uses Apache Spark, PySpark, and MLlib to detect fraudulent financial transactions using machine learning workflows."
    },
    dashboard: {
      keywords: ["dashboard", "streamlit", "tableau"],
      response: "Tajiri has built dashboards using Streamlit and Tableau, including a crime analytics dashboard and a global health analytics dashboard."
    },
    experience: {
      keywords: ["experience", "job", "career"],
      response: "Tajiri has experience with Christon Institutions in email infrastructure and website development. She also works as a freelance graphic designer and supports social media marketing projects."
    },
    education: {
      keywords: ["education", "university", "degree"],
      response: "Tajiri is pursuing a Bachelor of Computer Science, majoring in Business Analytics, through INTI International University and Coventry University. Her graduation date is 2026."
    },
    contact: {
      keywords: ["contact", "email", "hire", "reach"],
      response: "You can contact Tajiri by email at tajirihatibu72@gmail.com. You can also find her on GitHub as Tajiri-Bwika and LinkedIn as Tajiri Bwika."
    },
    resume: {
      keywords: ["resume", "cv"],
      response: "You can download Tajiri's resume using the Resume button in the navigation bar."
    },
    languages: {
      keywords: ["language", "speak"],
      response: "Tajiri speaks English fluently, Swahili natively, Turkish at an intermediate level, and Chinese at a beginner level."
    }
  };

  const fallbackResponse = "I don't have that answer yet. Try asking about Tajiri's skills, projects, experience, education, resume, or contact details.";

  // Add opening message
  function addMessage(text, isBot = true) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${isBot ? "bot" : "user"}`;
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Get bot response based on keywords
  function getBotResponse(userInput) {
    const lowerInput = userInput.toLowerCase();

    for (const [key, data] of Object.entries(keywordResponses)) {
      if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
        return data.response;
      }
    }

    return fallbackResponse;
  }

  // Send message handler
  function handleSendMessage() {
    const userMessage = chatbotInput.value.trim();

    if (!userMessage) return;

    // Display user message
    addMessage(userMessage, false);
    chatbotInput.value = "";

    // Simulate bot thinking with delay
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      addMessage(botResponse, true);
    }, 500);
  }

  // Event listeners
  chatbotButton.addEventListener("click", () => {
    chatbotModal.classList.add("open");
    chatbotInput.focus();
  });

  chatbotClose.addEventListener("click", () => {
    chatbotModal.classList.remove("open");
  });

  chatbotSend.addEventListener("click", handleSendMessage);

  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });

  // Show opening message when modal opens
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        if (chatbotModal.classList.contains("open") && chatbotMessages.children.length === 0) {
          addMessage("Hi, I'm Tajiri's portfolio assistant. Ask me about her skills, projects, experience, resume, or contact details.", true);
        }
      }
    });
  });

  observer.observe(chatbotModal, { attributes: true });
})();