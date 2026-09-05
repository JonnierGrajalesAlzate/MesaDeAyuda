const ICON_PATHS = {
  home: (
    <>
      <path d="M3.5 10.5 12 3l8.5 7.5" />
      <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7" />
    </>
  ),
  createTicket: (
    <>
      <path d="M5 4h10l4 4v12H5z" />
      <path d="M14 4v5h5M9 14h6M12 11v6" />
    </>
  ),
  tickets: (
    <>
      <path d="M4 6.5A2.5 2.5 0 0 0 6.5 9 2.5 2.5 0 0 0 4 11.5V18h16v-6.5A2.5 2.5 0 0 0 17.5 9 2.5 2.5 0 0 0 20 6.5V4H4z" />
      <path d="M9 7v4M9 14v2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.1.9-1.1 1.9M12 16.8h.01" />
    </>
  ),
  statistics: (
    <>
      <path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7" />
      <path d="M3 20h18" />
    </>
  ),
  news: (
    <>
      <path d="M5 5h13v15H6.5A2.5 2.5 0 0 1 4 17.5V6a1 1 0 0 1 1-1Z" />
      <path d="M18 8h2v9.5a2.5 2.5 0 0 1-2.5 2.5M8 9h6M8 12h6M8 15h4" />
    </>
  ),
  knowledge: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z" />
    </>
  ),
  reports: (
    <>
      <path d="M5 3h10l4 4v14H5z" />
      <path d="M14 3v5h5M8 17v-4M12 17V9M16 17v-6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20v-2.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V20" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.5 14.2h1.8a3.7 3.7 0 0 1 3.7 3.7V20" />
    </>
  )
};

export default function NavigationIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="workspace-nav-icon"
    >
      {ICON_PATHS[name] || ICON_PATHS.home}
    </svg>
  );
}
