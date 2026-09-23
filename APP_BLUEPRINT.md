# ClubComm - Application Blueprint

## Overview
ClubComm is a role-based club communication platform for SC Buitenveldert football club. It handles member management, training schedules, absence reporting, team communication, and administrative functions. The application has 23 pages serving 5 different user roles.

---

## PAGE 1: LOGIN PAGE (index.html)
**Purpose**: Main entry point for all users

**Key Functions**:
- User authentication with email/password
- Role-based access (4 test accounts available)
- Quick access buttons to test different roles
- Password recovery option (visual placeholder)
- Responsive design with blue/red gradient branding

**Test Accounts Available**:
- ouder@test.nl (Parent)
- hjo@test.nl (Club Administrator)
- trainer@test.nl (Coach)

**Connects To**:
- → registratie.html (Parent Registration)
- → qr-registratie.html (QR-based Registration)
- → ouderportaal.html (Parent Dashboard - if role: ouder)
- → trainer-dashboard.html (Coach Dashboard - if role: trainer)
- → hjo-dashboard.html (Admin Dashboard - if role: hjo)
- → teamleider-dashboard.html (Team Leader Dashboard - if role: teamleider)

---

## PAGE 2: PARENT REGISTRATION (registratie.html)
**Purpose**: New parent registration to the club

**Key Functions**:
- Parent personal data entry (name, email, phone, password)
- Child/Player information (name, birth date, KNVB number)
- QR code generation for easy mobile registration
- Notification preferences (email/SMS)
- Confirmation and final registration step

**Form Sections**:
1. Parent details (first name, last name, email, phone, password)
2. Child details (name, birth date, optional KNVB number)
3. Contact preferences (email/SMS notifications)
4. Confirmation step

**Connects To**:
- ← index.html (Back to Login)
- → Form submission to backend `/api/auth/register`

---

## PAGE 3: QR REGISTRATION (qr-registratie.html)
**Purpose**: Simplified registration via QR code scanning

**Key Functions**:
- QR code generation for quick registration link
- Lightweight registration form
- Mobile-optimized flow
- Parent and child quick entry

**Connects To**:
- ← index.html (Back to Login)
- → Form submission to backend

---

## PAGE 4: PARENT DASHBOARD (ouderportaal.html) [MAIN]
**Purpose**: Central hub for parents to manage their child's club participation

**Key Functions**:
1. **Next Activity Widget** - Shows upcoming training/match with date/time
2. **Quick Actions Menu** (4 main buttons):
   - Absence reporting (quick modal)
   - Planning view (calendar/schedule)
   - Transport coordination
   - Message board/communications

3. **Status Overview**:
   - Attendance percentage (95%)
   - Yellow card count
   - Monthly training count
   - Matches played
   - Attendance streak
   - Punctuality score

4. **Achievement System**:
   - Motivational badges
   - Performance indicators
   - Behavior alerts

5. **Logout & Profile Access**

**Key Features**:
- Real-time attendance tracking
- Quick absence reporting modal
- Notifications with badge counts
- Desktop-extended stats view
- Mobile-optimized layout

**Connects To**:
- ← index.html (Logout returns to login)
- → profiel.html (User Profile - top-right button)
- → overzicht.html (Planning/Schedule)
- → vervoer.html (Transportation)
- → prikbord.html (Message Board)
- → Absence reporting modal (stays on same page)

---

## PAGE 5: PLANNING/SCHEDULE (overzicht.html)
**Purpose**: Complete calendar view of all trainings and matches

**Key Functions**:
- Calendar view of all team activities
- Training schedules with times
- Match schedules with details
- Color-coded event types
- Click events for details
- Month/week view toggle

**Connects To**:
- ← ouderportaal.html (Back to Dashboard)
- → Individual event details/modals

---

## PAGE 6: TRANSPORTATION (vervoer.html)
**Purpose**: Organize team transportation and carpooling

**Key Functions**:
- View available transport options
- Request transport for away matches
- Join carpooling offers
- Driver coordination
- Passenger list management
- Cost sharing calculator

**Connects To**:
- ← ouderportaal.html (Back to Dashboard)
- → User profile details

---

## PAGE 7: MESSAGE BOARD/COMMUNICATIONS (prikbord.html)
**Purpose**: Team communication and announcements

**Key Functions**:
- View team announcements
- Send messages to team
- Direct messaging with parents/coaches
- Notification center
- Message filtering
- Read/unread status tracking

**Connects To**:
- ← ouderportaal.html (Back to Dashboard)
- Badge counter updates parent dashboard

---

## PAGE 8: USER PROFILE (profiel.html)
**Purpose**: Personal information and preferences management

**Key Functions**:
- Edit personal information
- Change password
- Notification preferences
- Privacy settings
- Emergency contact info
- Photo/avatar management

**Connects To**:
- ← ouderportaal.html (Back to Dashboard)
- ← trainer-dashboard.html (Back to Trainer Dashboard)
- ← hjo-dashboard.html (Back to Admin Dashboard)

---

## PAGE 9: COACH DASHBOARD (trainer-dashboard.html) [MAIN]
**Purpose**: Central hub for coaches to manage team training and players

**Key Functions**:
1. **Header Section**:
   - Coach name and team name
   - Current role/assignment

2. **Current Training Display**:
   - Training date/time
   - Team name (e.g., O10-1)
   - Location (if available)

3. **Player Grid**:
   - Individual player cards showing:
     - Player name
     - Jersey number
     - Attendance status (✓/✗)
     - Performance rating
     - Quick action buttons

4. **Player Management**:
   - Mark attendance during training
   - Note performance/skill level
   - View player statistics
   - Quick messaging

5. **Navigation Menu**:
   - Training management
   - Player performance stats
   - Message center
   - Settings/preferences

**Key Features**:
- Real-time attendance marking
- Performance tracking during sessions
- Quick player feedback
- Mobile and desktop optimized

**Connects To**:
- ← index.html (Logout returns to login)
- → profiel.html (Profile settings)
- → trainer-absentie.html (Absence Management)
- → trainer-statistieken.html (Player Statistics)
- → trainer-berichten.html (Messages/Communications)
- → trainer-speeltijd.html (Play Time Tracking)
- → trainer-instellingen.html (Coach Settings)
- → trainer-beoordeling.html (Player Ratings/Reviews)

---

## PAGE 10: TRAINER ABSENCE MANAGEMENT (trainer-absentie.html)
**Purpose**: Track and manage player absences from training

**Key Functions**:
- View absence reports from parents
- Approve/reject absence claims
- Track absence patterns
- Warn system (yellow/red cards)
- Generate absence reports
- Manage team roster based on attendance

**Connects To**:
- ← trainer-dashboard.html (Back to Dashboard)
- ← index.html (Logout)

---

## PAGE 11: TRAINER STATISTICS (trainer-statistieken.html)
**Purpose**: View player performance metrics and team statistics

**Key Functions**:
- Individual player performance stats
- Team overall statistics
- Attendance trends
- Performance ratings over time
- Comparison charts
- Export reports

**Connects To**:
- ← trainer-dashboard.html (Back to Dashboard)
- ← index.html (Logout)

---

## PAGE 12: TRAINER MESSAGES (trainer-berichten.html)
**Purpose**: Messaging system for coach communication

**Key Functions**:
- Send messages to parents
- Send team announcements
- Receive parent questions
- Message history
- Notification management

**Connects To**:
- ← trainer-dashboard.html (Back to Dashboard)
- ← index.html (Logout)

---

## PAGE 13: TRAINER PLAY TIME (trainer-speeltijd.html)
**Purpose**: Track playing time for each player in matches

**Key Functions**:
- Record play time during matches
- Track substitutions
- Minutes played per player
- Performance during play
- Generate play time reports

**Connects To**:
- ← trainer-dashboard.html (Back to Dashboard)
- ← index.html (Logout)

---

## PAGE 14: TRAINER SETTINGS (trainer-instellingen.html)
**Purpose**: Coach profile and preference management

**Key Functions**:
- Edit profile information
- Change password
- Notification preferences
- Training preferences
- Communication settings

**Connects To**:
- ← trainer-dashboard.html (Back to Dashboard)
- ← profiel.html (Global profile management)

---

## PAGE 15: TRAINER RATING/REVIEWS (trainer-beoordeling.html)
**Purpose**: Provide performance evaluations for players

**Key Functions**:
- Rate player performance per training
- Skill assessment (technical, tactical, physical, mental)
- Development notes
- Feedback form
- Archive ratings over season

**Connects To**:
- ← trainer-dashboard.html (Back to Dashboard)
- ← trainer-statistieken.html (View aggregated stats)

---

## PAGE 16: HJO (CLUB ADMIN) DASHBOARD (hjo-dashboard.html) [MAIN]
**Purpose**: Administrative hub for club management

**Key Functions**:
1. **Pending Registrations Card**:
   - Review new parent registrations
   - Approve/reject applications
   - Team assignment decisions

2. **Team Management Card**:
   - View all teams
   - Create new teams
   - Manage team rosters
   - Team assignments

3. **Coach Management Card**:
   - Approve new coaches
   - Assign coaches to teams
   - View coach assignments

4. **Players Overview Card**:
   - Total registered players
   - View all player profiles
   - Edit player information
   - Manage player registrations

5. **System Status**:
   - Active users online
   - System health
   - Recent activities

6. **Quick Actions**:
   - Review pending items
   - Create announcements
   - System settings access

**Key Features**:
- Approval workflow management
- Team and roster management
- User administration
- System oversight

**Connects To**:
- ← index.html (Logout returns to login)
- → profiel.html (Profile settings)
- → Various management modals (stay on same page)

---

## PAGE 17: TEAM LEADER DASHBOARD (teamleider-dashboard.html)
**Purpose**: Team-specific management for team leaders

**Key Functions**:
- Team roster management
- Sub-team assignments
- Communication with team members
- Team event scheduling
- Report generation for team

**Connects To**:
- ← index.html (Logout)
- → teamleider-speeltijd.html (Team play time)
- → profiel.html (Profile)

---

## PAGE 18: TEAM LEADER PLAY TIME (teamleider-speeltijd.html)
**Purpose**: Track play time at team level

**Key Functions**:
- View team play time statistics
- Track all player minutes in team
- Compare play time across levels

**Connects To**:
- ← teamleider-dashboard.html (Back to Dashboard)

---

## PAGE 19: PLAYER MANAGEMENT (spelers-beheren.html)
**Purpose**: Administrative player profile management

**Key Functions**:
- View all players
- Edit player profiles
- Manage player status
- Update player information
- Bulk player operations

**Connects To**:
- ← hjo-dashboard.html (Back to Admin)
- ← index.html (Logout)

---

## PAGE 20: COACH MANAGEMENT (trainers-beheren.html)
**Purpose**: Administrative coach profile management

**Key Functions**:
- View all coaches
- Add new coaches
- Edit coach profiles
- Assign coaches to teams
- Manage coach status

**Connects To**:
- ← hjo-dashboard.html (Back to Admin)
- ← index.html (Logout)

---

## PAGE 21: ANALYTICS HUB (analytics-hub.html)
**Purpose**: Data analytics and reporting for club management

**Key Functions**:
- Attendance trends
- Performance analytics
- Team statistics
- Player development tracking
- Custom report generation
- Dashboard widgets

**Connects To**:
- ← hjo-dashboard.html (Back to Admin)
- ← trainer-dashboard.html (For coaches)
- ← index.html (Logout)

---

## PAGE 22: REWARDS/ACHIEVEMENTS (beloningen.html)
**Purpose**: Gamification and achievement system

**Key Functions**:
- View earned achievements/badges
- Attendance streaks
- Performance milestones
- Team recognition
- Leaderboards

**Connects To**:
- ← ouderportaal.html (Parent dashboard link)
- ← trainer-dashboard.html (Coach dashboard link)

---

## PAGE 23: TASKS (taken.html)
**Purpose**: Task management for team coordinators

**Key Functions**:
- View team tasks/assignments
- Task assignment management
- Deadline tracking
- Status updates
- Task completion reports

**Connects To**:
- ← ouderportaal.html (For parents)
- ← trainer-dashboard.html (For coaches)
- ← hjo-dashboard.html (For admins)

---

## USER ROLE FLOW DIAGRAM

```
LOGIN (index.html)
│
├─→ [Role: Parent] → ouderportaal.html (Parent Dashboard)
│   ├─→ overzicht.html (Schedule)
│   ├─→ vervoer.html (Transport)
│   ├─→ prikbord.html (Messages)
│   ├─→ profiel.html (Profile)
│   └─→ beloningen.html (Achievements)
│
├─→ [Role: Trainer] → trainer-dashboard.html (Coach Dashboard)
│   ├─→ trainer-absentie.html (Absence)
│   ├─→ trainer-statistieken.html (Stats)
│   ├─→ trainer-berichten.html (Messages)
│   ├─→ trainer-speeltijd.html (Play Time)
│   ├─→ trainer-instellingen.html (Settings)
│   ├─→ trainer-beoordeling.html (Ratings)
│   ├─→ profiel.html (Profile)
│   └─→ beloningen.html (Achievements)
│
├─→ [Role: HJO Admin] → hjo-dashboard.html (Admin Dashboard)
│   ├─→ spelers-beheren.html (Manage Players)
│   ├─→ trainers-beheren.html (Manage Coaches)
│   ├─→ analytics-hub.html (Analytics)
│   ├─→ profiel.html (Profile)
│   └─→ taken.html (Tasks)
│
└─→ [Role: Team Leader] → teamleider-dashboard.html
    ├─→ teamleider-speeltijd.html (Play Time)
    ├─→ profiel.html (Profile)
    └─→ beloningen.html (Achievements)
```

---

## BACKEND API ENDPOINTS (server.js)

1. **Authentication**
   - `POST /api/auth/login` - Login with email/password
   - `POST /api/auth/register` - Register new parent

2. **Attendance**
   - `POST /api/attendance/absence` - Report absence
   - Response includes yellow card flag if late report

3. **HJO Functions**
   - `GET /api/hjo/pending-registrations` - Get new registrations
   - `POST /api/hjo/approve-registration/:id` - Approve/reject registration

4. **Health Check**
   - `GET /api/health` - Server status

---

## COLOR SCHEME
- **Primary Blue**: #1e5ba8 - Main action color
- **Dark Blue**: #164a91 - Headers/emphasis
- **Orange**: #ff6b00 - Accent/alerts
- **Green**: #10b981 - Success/presence
- **Red**: #dc2626 - Absence/alerts
- **Teal**: #0f766e - Transport
- **Gray**: #64748b - Secondary text

---

## SUMMARY STATISTICS
- **Total Pages**: 23
- **User Roles**: 5 (Parent, Coach, Admin, Team Leader, Guest)
- **Main Dashboard Pages**: 4 (Parent, Coach, Admin, Team Leader)
- **Secondary Pages**: 19

**Development Status**: Currently in development mode with test accounts and demo data. Database integration pending.
