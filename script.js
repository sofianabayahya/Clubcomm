// Centraal gebruikersbeheer
let users = {
  "ouder@example.com": { password: "test123", role: "ouder" },
  "trainer@example.com": { password: "trainer123", role: "trainer" },
  "hjo@example.com": { password: "hjo123", role: "hjo" },
  "teamleider@example.com": { password: "teamleider123", role: "teamleider" }
};

// Globale app state
const AppState = {
  currentUser: null,
  currentTeam: 'O10-1',
  currentPlayer: 'Jesse de Jong',
  initialized: false
};

// Centraal notification systeem
if (typeof window.NotificationManager === 'undefined') {
  window.NotificationManager = {
    show: function(message, type = 'info', duration = 4000) {
      const existingNotifications = document.querySelectorAll('.app-notification');
      existingNotifications.forEach(notif => notif.remove());

      const notification = document.createElement('div');
      notification.className = 'app-notification';
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${this.getColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        z-index: 10000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        max-width: 300px;
        animation: slideInRight 0.3s ease;
        font-family: 'Inter', sans-serif;
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-${this.getIcon(type)}"></i>
          <span>${message}</span>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    },

    getColor: function(type) {
      const colors = {
        'success': '#10b981',
        'warning': '#f59e0b', 
        'error': '#ef4444',
        'info': '#3b82f6'
      };
      return colors[type] || colors.info;
    },

    getIcon: function(type) {
      const icons = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle',
        'info': 'info-circle'
      };
      return icons[type] || icons.info;
    }
  };
}

// Universal navigation function - WERKEND
function navigateToPage(page) {
  console.log('navigateToPage called with:', page);

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === page) {
    console.log('Already on page:', page);
    return;
  }

  document.body.style.opacity = '0.8';
  document.body.style.transition = 'opacity 200ms ease';

  setTimeout(() => {
    console.log('Navigating to:', page);
    window.location.href = page;
  }, 100);
}

// Universal logout function
function logout() {
  if (confirm('Weet je zeker dat je wilt uitloggen?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('yellowCards');
    localStorage.removeItem('absences');
    localStorage.removeItem('trainerHJONotifications');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  }
}

// Helper functions
function getCurrentPlayer() {
  return localStorage.getItem('currentPlayerName') || 'Jesse de Jong';
}

function getCurrentTeam() {
  return localStorage.getItem('currentTeam') || 'O10-1';
}

// Initialisatie functie
function initializeApp() {
  if (AppState.initialized) return;

  AppState.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  AppState.currentTeam = localStorage.getItem('currentTeam') || 'O10-1';
  AppState.currentPlayer = localStorage.getItem('currentPlayerName') || 'Jesse de Jong';

  AppState.initialized = true;
}

// Login functie
async function handleLogin() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  if (!email || !pass) {
    showError("Vul alle velden in");
    return;
  }

  const loginBtn = document.querySelector('.btn-primary') || document.querySelector('.btn');
  if (loginBtn) {
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inloggen...';
    loginBtn.disabled = true;

    try {
      if (email === "ouder@test.nl" || email.includes("ouder")) {
        setUserSession("ouder", email);
        window.location.href = "ouderportaal.html";
      } else if (email === "trainer@test.nl" || email.includes("trainer")) {
        setUserSession("trainer", email);
        window.location.href = "trainer-dashboard.html";
      } else if (email === "teamleider@test.nl" || email.includes("teamleider")) {
        setUserSession("teamleider", email);
        window.location.href = "teamleider-dashboard.html";
      } else if (email === "hjo@test.nl" || email.includes("hjo")) {
        setUserSession("hjo", email);
        window.location.href = "hjo-dashboard.html";
      } else {
        showError("Verkeerde inloggegevens. Probeer: ouder@test.nl, trainer@test.nl, hjo@test.nl");
      }
    } catch (error) {
      console.error('Login failed:', error);
      showError("Er is een fout opgetreden bij het inloggen");
    } finally {
      loginBtn.innerHTML = originalText;
      loginBtn.disabled = false;
    }
  }
}

function setUserSession(role, email, name = null) {
  const userData = { 
    role, 
    email, 
    name: name || email.split('@')[0], 
    loginTime: new Date().toISOString() 
  };
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('userRole', role);
}

function showError(message) {
  const errorElement = document.getElementById("loginError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    alert(message);
  }
}

// Afmelden functie met gele kaart logica
function afmelden(datum, reden) {
  if (!reden || reden.trim() === '') {
    console.log('Geen geldige reden geselecteerd');
    return;
  }

  if (!datum || datum.trim() === '') {
    console.error('Geen geldige datum opgegeven');
    NotificationManager.show('❌ Geen geldige datum opgegeven', 'error');
    return;
  }

  try {
    const hoursUntilTraining = getHoursUntilTraining(datum);
    const confirmMessage = `U wilt uw kind afmelden voor deze reden:\n\n"${reden}"\n\nDatum: ${datum}\n\nWeet u zeker dat u door wilt gaan?`;

    if (confirm(confirmMessage)) {
      if (hoursUntilTraining < 3 && hoursUntilTraining > 0) {
        issueYellowCard(datum, reden);
        processAbsence(datum, reden, true);
      } else if (hoursUntilTraining <= 0) {
        NotificationManager.show('❌ Training is al begonnen. Neem direct contact op met de trainer.', 'error');
        return;
      } else {
        processAbsence(datum, reden, false);
      }
    } else {
      const dropdown = event.target;
      if (dropdown) {
        dropdown.selectedIndex = 0;
      }
    }
  } catch (error) {
    console.error('Error in afmelden function:', error);
    NotificationManager.show('Er is een fout opgetreden bij het afmelden. Probeer opnieuw.', 'error');
  }
}

function getHoursUntilTraining(datum) {
  const now = new Date();
  const currentTeam = localStorage.getItem('currentTeam') || 'O10-1';
  const teamSchedules = getTeamTrainingSchedule(currentTeam);
  const trainingDate = parseTrainingDate(datum, teamSchedules);

  if (!trainingDate) {
    console.log(`Kon geen training vinden voor datum: ${datum}`);
    return 24;
  }

  const diffMs = trainingDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  console.log(`Training ${datum} op ${trainingDate}, verschil: ${diffHours.toFixed(1)} uur`);
  return Math.max(0, diffHours);
}

function getTeamTrainingSchedule(team) {
  const schedules = {
    'O6-1': [{ day: 3, time: '16:00' }, { day: 6, time: '10:00' }],
    'O7-1': [{ day: 3, time: '16:30' }, { day: 6, time: '10:30' }],
    'O8-1': [{ day: 3, time: '17:00' }, { day: 6, time: '11:00' }],
    'O9-1': [{ day: 3, time: '17:30' }, { day: 5, time: '18:00' }],
    'O10-1': [{ day: 3, time: '18:00' }, { day: 5, time: '18:30' }],
    'O11-1': [{ day: 3, time: '18:30' }, { day: 5, time: '19:00' }],
    'O12-1': [{ day: 3, time: '19:00' }, { day: 5, time: '19:30' }]
  };

  const customTimes = JSON.parse(localStorage.getItem('teamTrainingTimes') || '{}');
  return customTimes[team] || schedules[team] || schedules['O10-1'];
}

function parseTrainingDate(datumString, schedule) {
  const now = new Date();

  if (datumString.includes('juni') || datumString.includes('maart') || datumString.includes('april')) {
    return parseSpecificDate(datumString);
  }

  return findNextTraining(schedule);
}

function parseSpecificDate(datumString) {
  const currentYear = new Date().getFullYear();
  const monthMap = {
    'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
  };

  const parts = datumString.toLowerCase().split(' ');
  let day, month, time = '18:30';

  for (let i = 0; i < parts.length; i++) {
    if (!isNaN(parts[i])) {
      day = parseInt(parts[i]);
    }
    if (monthMap[parts[i]] !== undefined) {
      month = monthMap[parts[i]];
    }
  }

  if (day && month !== undefined) {
    const date = new Date(currentYear, month, day);
    const dayOfWeek = date.getDay();

    if (date < new Date()) {
      date.setFullYear(currentYear + 1);
    }

    if (dayOfWeek === 3) time = '18:30';
    else if (dayOfWeek === 5) time = '18:30';
    else if (dayOfWeek === 6) time = '14:00';

    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    return date;
  }

  return null;
}

function findNextTraining(schedule) {
  const now = new Date();
  const today = now.getDay();

  for (let i = 0; i < 7; i++) {
    const checkDay = (today + i) % 7;
    const trainingToday = schedule.find(s => s.day === checkDay);

    if (trainingToday) {
      const trainingDate = new Date(now);
      trainingDate.setDate(now.getDate() + i);

      const [hours, minutes] = trainingToday.time.split(':').map(Number);
      trainingDate.setHours(hours, minutes, 0, 0);

      if (i === 0 && trainingDate > now) {
        return trainingDate;
      } else if (i > 0) {
        return trainingDate;
      }
    }
  }

  return null;
}

function issueYellowCard(datum, reden, type = 'Te laat afgemeld') {
  const yellowCards = JSON.parse(localStorage.getItem('yellowCards') || '[]');
  const newCard = {
    id: Date.now(),
    datum: datum,
    reden: reden,
    timestamp: new Date().toISOString(),
    type: type,
    canBeReversed: true,
    issuedBy: 'system'
  };

  yellowCards.push(newCard);
  localStorage.setItem('yellowCards', JSON.stringify(yellowCards));

  const cardCount = yellowCards.length;

  if (cardCount === 1) {
    showFriendlyReminder(datum, 'first_card');
  } else if (cardCount >= 3) {
    showYellowCardNotification(datum, 'conversation_required');
  } else {
    showYellowCardNotification(datum, 'warning');
  }

  console.log('Gele kaart uitgegeven:', newCard);
}

function showFriendlyReminder(datum, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    max-width: 90%;
    animation: slideIn 0.5s ease;
  `;

  const messages = {
    first_card: {
      icon: '💙',
      title: 'Vriendelijke Herinnering',
      message: `Let op, je kind stond niet op de afmeldlijst voor ${datum}. Graag volgende keer even via de app afmelden.`,
      subtitle: 'Dit helpt de trainer en andere ouders met de planning.'
    }
  };

  const msg = messages[type];

  notification.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem;">${msg.icon}</div>
    <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">${msg.title}</h3>
    <p style="margin: 0 0 1.5rem 0; line-height: 1.5;">${msg.message}</p>
    <p style="margin: 0 0 1.5rem 0; font-size: 0.9rem; opacity: 0.9;">${msg.subtitle}</p>
    <button onclick="this.parentElement.remove()" style="
      background: rgba(255,255,255,0.2);
      border: 2px solid white;
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    ">Dank je wel</button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 8000);
}

function showYellowCardNotification(datum, severity = 'warning') {
  const notification = document.createElement('div');

  const severityStyles = {
    warning: {
      background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
      icon: '🟨',
      title: 'Gele Kaart Uitgegeven'
    },
    conversation_required: {
      background: 'linear-gradient(135deg, #dc2626, #991b1b)',
      icon: '🟥',
      title: 'Gesprek Vereist'
    }
  };

  const style = severityStyles[severity];

  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${style.background};
    color: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    max-width: 90%;
    animation: slideIn 0.5s ease;
  `;

  const yellowCards = JSON.parse(localStorage.getItem('yellowCards') || '[]');
  const cardCount = yellowCards.length;

  notification.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem;">${style.icon}</div>
    <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">${style.title}</h3>
    <p style="margin: 0 0 1.5rem 0; line-height: 1.5;">
      ${severity === 'conversation_required' 
        ? `Je hebt nu ${cardCount} gele kaarten. Er wordt een gesprek gepland met de HJO.`
        : `Je hebt een gele kaart ontvangen voor "Te laat afgemeld" voor de training van ${datum}.`
      }
    </p>
    <p style="margin: 0 0 1.5rem 0; font-size: 0.9rem; opacity: 0.9;">
      ${severity === 'conversation_required' 
        ? '⚠️ Dit gedrag moet stoppen om verdere gevolgen te voorkomen.'
        : `⚠️ Let op: Bij 3 gele kaarten volgt automatisch een gesprek.`
      }
    </p>
    <button onclick="this.parentElement.remove()" style="
      background: rgba(255,255,255,0.2);
      border: 2px solid white;
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    ">Begrepen</button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

function processAbsence(datum, reden, isLateAbsence = false) {
  const dropdown = event ? event.target : null;
  const player = getCurrentPlayer();
  const team = getCurrentTeam();

  if (isLateAbsence) {
    if (dropdown) {
      dropdown.innerHTML = `<option value="afgemeld" selected>🟨 ${reden}</option>`;
      dropdown.style.backgroundColor = '#ffeb3b';
      dropdown.style.color = '#000';
    }
  } else {
    if (dropdown) {
      dropdown.innerHTML = `<option value="afgemeld" selected>Afgemeld</option>`;
      dropdown.style.backgroundColor = '#22c55e';
      dropdown.style.color = 'white';
      dropdown.style.fontWeight = 'bold';
      dropdown.style.border = '2px solid #22c55e';
    }
  }

  if (dropdown) dropdown.disabled = true;

  const absences = JSON.parse(localStorage.getItem('absences') || '[]');
  const absenceData = {
    id: Date.now(),
    datum: datum,
    reden: reden,
    timestamp: new Date().toISOString(),
    isLate: isLateAbsence,
    player: player,
    team: team,
    trainingDate: calculateTrainingDate(datum)
  };
  absences.push(absenceData);
  localStorage.setItem('absences', JSON.stringify(absences));

  syncAbsenceToTeamleider(absenceData);
  syncAbsenceToTrainer(player,team,datum,isLateAbsence,reden);

  showAbsenceConfirmation(datum, reden, isLateAbsence);
}

function showAbsenceConfirmation(datum, reden, isLateAbsence = false) {
  const confirmation = document.createElement('div');

  if (isLateAbsence) {
    confirmation.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      padding: 1rem 2rem;
      border-radius: 25px;
      z-index: 1000;
      animation: slideUp 0.5s ease;
      text-align: center;
      max-width: 90%;
    `;

    confirmation.innerHTML = `
      🟨 Afgemeld voor ${datum}<br>
      <small style="opacity: 0.9;">Reden: ${reden} | Gele kaart toegekend</small>
    `;
  } else {
    confirmation.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #28a745;
      color: white;
      padding: 1rem 2rem;
      border-radius: 25px;
      z-index: 1000;
      animation: slideUp 0.5s ease;
    `;

    confirmation.innerHTML = `✅ Afgemeld voor ${datum} (${reden})`;
  }

  document.body.appendChild(confirmation);

  setTimeout(() => confirmation.remove(), 4000);
}

function calculateTrainingDate(datumString) {
  // Converteer datum string naar echte datum voor trainings planning
  const schedule = getTeamTrainingSchedule(getCurrentTeam());
  return parseTrainingDate(datumString, schedule);
}

function syncAbsenceToTeamleider(absenceData) {
  // Store absence for teamleider dashboard
  const teamleaderAbsences = JSON.parse(localStorage.getItem('teamleaderAbsences') || '[]');
  teamleaderAbsences.push({
    ...absenceData,
    syncedAt: new Date().toISOString(),
    source: 'ouderportaal'
  });
  localStorage.setItem('teamleaderAbsences', JSON.stringify(teamleaderAbsences));

  // Create notification for teamleader
  const teamleaderNotifications = JSON.parse(localStorage.getItem('teamleaderNotifications') || '[]');
  teamleaderNotifications.push({
    id: Date.now(),
    type: 'new_absence',
    team: absenceData.team,
    player: absenceData.player,
    title: `Nieuwe afmelding: ${absenceData.player}`,
    message: `${absenceData.player} heeft zich afgemeld voor ${absenceData.datum}. Reden: ${absenceData.reden}`,
    absenceData: absenceData,
    timestamp: new Date().toISOString(),
    read: false
  });
  localStorage.setItem('teamleaderNotifications', JSON.stringify(teamleaderNotifications));

  console.log(`📧 Afmelding gesynchroniseerd naar teamleider dashboard: ${absenceData.player} - ${absenceData.datum}`);
}

function syncAbsenceToTrainer(player, team, datum, isLateAbsence, reden) {
  // Mark absence in trainer dashboard
  const trainerAttendance = JSON.parse(localStorage.getItem('trainerAttendanceData') || '{}');
  const trainingKey = `${team}_${datum}`;

  if (!trainerAttendance[trainingKey]) {
    trainerAttendance[trainingKey] = {};
  }

  trainerAttendance[trainingKey][player] = {
    status: isLateAbsence ? 'noshow' : 'absent',
    reason: reden,
    timestamp: new Date().toISOString(),
    isLateAbsence: isLateAbsence
  };

  localStorage.setItem('trainerAttendanceData', JSON.stringify(trainerAttendance));

  // Inform trainer
  const message = `${player} heeft zich ${isLateAbsence ? 'te laat' : ''} afgemeld voor ${datum}. Reden: ${reden}`;
  notifyTrainer(team, message, isLateAbsence ? 'late_absence' : 'normal_absence');
}

function notifyTrainer(team, message, type) {
  const trainerNotifications = JSON.parse(localStorage.getItem('trainerNotifications') || '[]');

  trainerNotifications.unshift({
    id: Date.now(),
    team: team,
    message: message,
    type: type,
    timestamp: new Date().toISOString(),
    read: false,
    priority: type === 'late_absence' ? 'high' : 'normal'
  });

  localStorage.setItem('trainerNotifications', JSON.stringify(trainerNotifications));
}

// Make all functions globally available
window.navigateToPage = navigateToPage;
window.logout = logout;
window.getCurrentPlayer = getCurrentPlayer;
window.getCurrentTeam = getCurrentTeam;
window.afmelden = afmelden;
window.handleLogin = handleLogin;
window.getHoursUntilTraining = getHoursUntilTraining;

// App initialisatie
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 App wordt geïnitialiseerd');

  try {
    initializeApp();
    updateNotificationCount();
    setupSimpleNavigation();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    console.log('✅ App geïnitialiseerd');
  } catch (error) {
    console.error('App initialization error:', error);
  }
});

function updateNotificationCount() {
  // Update notification badges
  const badges = document.querySelectorAll('.notification-badge');
  const yellowCards = JSON.parse(localStorage.getItem('yellowCards') || '[]');
  const unreadCount = yellowCards.filter(card => !card.read).length;

  badges.forEach(badge => {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  });
}

// Eenvoudige navigatie systeem - WERKEND
function setupSimpleNavigation() {
  console.log('🚀 Eenvoudige navigatie wordt geïnitialiseerd');

  // Wacht tot DOM geladen is
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
  } else {
    initializeNavigation();
  }

  function initializeNavigation() {
    const navButtons = document.querySelectorAll('.menubalk button, .menubalk .nav-item');
  
    navButtons.forEach(button => {
      // Verwijder oude event listeners
      button.onclick = null;
  
      // Voeg nieuwe click handler toe
      button.addEventListener('click', function(e) {
        e.preventDefault();
        handleNavClick(this);
      });
    });
    updateActiveNavState();
    console.log('✅ Navigatie geïnitialiseerd');
  }
  
  function handleNavClick(button) {
    try {
      // Prevent multiple clicks
      if (button.dataset.clicking === 'true') return;
      button.dataset.clicking = 'true';
  
      // Visual feedback
      button.style.transform = 'scale(0.95)';
  
      // Bepaal de pagina om naar toe te gaan
      const onclick = button.getAttribute('onclick') || '';
      let targetPage = '';
  
      if (onclick.includes('ouderportaal.html')) {
        targetPage = 'ouderportaal.html';
      } else if (onclick.includes('overzicht.html')) {
        targetPage = 'overzicht.html';
      } else if (onclick.includes('vervoer.html')) {
        targetPage = 'vervoer.html';
      } else if (onclick.includes('prikbord.html')) {
        targetPage = 'prikbord.html';
      } else if (onclick.includes('taken.html')) {
        targetPage = 'taken.html';
      }
  
      if (targetPage) {
        console.log('Navigating to:', targetPage);
  
        // Gebruik de globale navigateToPage functie
        if (typeof window.navigateToPage === 'function') {
          window.navigateToPage(targetPage);
        } else {
          // Fallback directe navigatie
          window.location.href = targetPage;
        }
      } else {
        console.warn('Geen target pagina gevonden voor button:', button);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: probeer directe navigatie
      if (targetPage) {
        window.location.href = targetPage;
      }
    } finally {
      // Reset button state altijd
      setTimeout(() => {
        button.style.transform = '';
        button.dataset.clicking = 'false';
      }, 200);
    }
  }
  
  function updateActiveNavState() {
    const navButtons = document.querySelectorAll('.menubalk .nav-item');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
    navButtons.forEach(button => {
      button.classList.remove('active');
  
      const onclick = button.getAttribute('onclick') || '';
  
      if (
        (currentPage === 'ouderportaal.html' && onclick.includes('ouderportaal.html')) ||
        (currentPage === 'overzicht.html' && onclick.includes('overzicht.html')) ||
        (currentPage === 'vervoer.html' && onclick.includes('vervoer.html')) ||
        (currentPage === 'prikbord.html' && onclick.includes('prikbord.html')) ||
        (currentPage === 'taken.html' && onclick.includes('taken.html'))
      ) {
        button.classList.add('active');
      }
    });
  }
}

// CSS voor animaties
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .app-notification {
      animation: slideInRight 0.3s ease !important;
    }

    @keyframes slideUp {
      from {
        transform: translate(-50%, 100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}