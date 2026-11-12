// Every product on the site is one entry in this list.
// To add a product: copy an entry, change its fields, put its images in media/<slug>/, run `node src/build.mjs`.
// Section types a product page can use, in any order:
//   problem, features, gallery, wall, say, routes, modes, video, install, limits, compat, aside
// Status kinds: released | early | beta | live | lab

const gh = 'https://github.com/nisar87/';

export const products = [
  {
    slug: 'netmerge',
    name: 'NetMerge',
    tagline: 'Every internet line you have, working at once.',
    summary: 'Combines your cable, Wi-Fi and hotspot into one faster connection on Windows 11. No extra hardware, no paid service.',
    category: 'Networking',
    platforms: ['Windows', 'Android'],
    platformNote: 'Windows 11 · Android in test builds',
    status: { kind: 'released', label: 'Released' },
    version: '3.17.5',
    repo: 'netmerge',
    accent: '#35d6b9',
    accent2: '#f2a93b',
    featured: true,
    mark: '<path d="M11 15C20 15 20 24 26 24M11 33C20 33 20 24 26 24H37"/><path d="M33 20l4.5 4-4.5 4"/><circle cx="11" cy="15" r="2.6" fill="currentColor" stroke="none"/><circle cx="11" cy="33" r="2.6" fill="currentColor" stroke="none"/>',
    cover: { src: 'netmerge/overview-dark.webp', w: 1440, h: 900, alt: 'NetMerge overview: a LAN line and a Wi-Fi line with live speed graphs and a combined download figure.' },
    hero: 'wide',
    actions: [
      { label: 'Download for Windows', href: gh + 'netmerge/releases/latest', kind: 'download' },
      { label: 'Source on GitHub', href: gh + 'netmerge' },
    ],
    sections: [
      { type: 'problem', eyebrow: 'The problem', title: 'Two connections at home. One doing all the work.',
        body: [
          'Plenty of homes have a cable line and a second way online: Wi-Fi from another provider, or a phone hotspot. Windows picks one and ignores the rest.',
          'NetMerge hands every new connection your programs open to whichever line has the most room right now. Browsers, download managers and game launchers open many connections, so they end up drawing on all your lines together.',
        ] },
      { type: 'gallery', title: 'A look inside', note: 'Screenshots from the current version.', items: [
          { src: 'netmerge/overview-full.webp', w: 1440, h: 1368, alt: 'NetMerge overview in dark mode with a combined speed graph and one card per connection.', caption: 'Overview. Live speed of every line, and how the work is shared between them.' },
          { src: 'netmerge/usage-light.webp', w: 1440, h: 1000, alt: 'NetMerge usage page with data used per connection per day and a monthly allowance form.', caption: 'Usage. Data per line per day, with a monthly allowance and a forecast.' },
          { src: 'netmerge/apps-light.webp', w: 1440, h: 1000, alt: 'NetMerge apps page listing programs and the line each one uses.', caption: 'Apps. Send a program to one line, or keep it off the merge.' },
          { src: 'netmerge/share-light.webp', w: 1440, h: 1000, alt: 'NetMerge share page with a QR code for a phone.', caption: 'Share. Scan a code and your phone uses the merged connection too.' },
          { src: 'netmerge/presets-light.webp', w: 1440, h: 1000, alt: 'NetMerge presets page with one-click setups.', caption: 'Presets. Gaming, work, travel and your own, with a schedule.' },
        ] },
      { type: 'features', layout: 'grid', title: 'What it does', items: [
          { title: 'Three ways to merge', text: 'Send each connection to the fastest line, keep each website on one line, or use one line with the others as backup.' },
          { title: 'A role for every line', text: 'Use a line always, only when the others are busy, or only as a backup. Handy for a hotspot with limited data.' },
          { title: 'Calls stay steady', text: 'Meeting apps are kept on one line, and new downloads move to the others while you are on a call.' },
          { title: 'Ads and trackers blocked', text: 'Optional blocking with downloadable filter lists.' },
          { title: 'Dead lines step aside', text: 'A line without internet is left out until it works again.' },
          { title: 'It tells you when merging cannot help', text: 'If two lines leave through the same public address, NetMerge says so.' },
        ] },
      { type: 'aside', eyebrow: 'On the bench', title: 'NetMerge for Android',
        body: 'The same idea on a phone: Wi-Fi and mobile data at the same time. It runs as working test builds and is not released. On a Galaxy S26 Ultra with two fast networks, many-connection downloads measured about 38% faster, and dropping a network mid-download stalled it for under 3 seconds.',
        link: { label: 'Get a test build', href: gh + 'netmerge-android/releases/tag/test-build' } },
      { type: 'limits', title: 'Honest limits', items: [
          'One single connection can only use one line. A single-stream speed test shows one line\'s speed. The gain comes from many connections at once.',
          'Two lines from the same provider usually cannot add speed.',
          'Other firewall or VPN drivers can conflict with NetMerge\'s virtual adapter. It warns you if it finds one.',
          'The app is not code-signed yet, so Windows asks you to confirm the first run.',
        ] },
      { type: 'compat', title: 'What you need', rows: [
          ['Runs on', 'Windows 11, 64-bit'],
          ['Needs', 'Administrator rights, and two or more active connections'],
          ['Engine', 'mihomo (open source), fetched on first start'],
          ['Licence', 'MIT'],
        ] },
    ],
  },

  {
    slug: 'pullwell',
    name: 'Pullwell',
    tagline: 'Downloads that finish.',
    summary: 'A download manager for Windows that resumes after crashes and dropped connections, checks every finished file, and sends no telemetry.',
    category: 'Downloads',
    platforms: ['Windows'],
    platformNote: 'Windows 10 and 11',
    status: { kind: 'early', label: 'Early releases' },
    version: '0.10.0',
    repo: 'pullwell',
    accent: '#4fd0a0',
    accent2: '#d9f27a',
    featured: true,
    mark: '<path d="M24 11v17M17 21.5l7 7 7-7"/><path d="M13 28v6h22v-6"/>',
    cover: { src: 'pullwell/desktop-dark.webp', w: 1280, h: 800, alt: 'Pullwell main window in dark mode with a list of sample downloads.' },
    hero: 'split',
    actions: [
      { label: 'Download for Windows', href: gh + 'pullwell/releases/latest', kind: 'download' },
      { label: 'Source on GitHub', href: gh + 'pullwell' },
    ],
    sections: [
      { type: 'problem', eyebrow: 'The problem', title: 'Big downloads fail in boring ways.',
        body: [
          'The connection drops at 94%. The PC restarts overnight. The file arrives a few bytes short and nothing tells you.',
          'Pullwell picks up where it stopped after a crash, a restart or a lost connection. It never calls a file finished unless the size is right, and the checksum too when one is known.',
        ] },
      { type: 'features', layout: 'rows', title: 'What it does', items: [
          { title: 'Several connections per file', text: 'Files are fetched in parts over several connections at once, which is also what lets NetMerge spread one download across lines.' },
          { title: 'Queues with their own hours', text: 'A scheduler, speed limits overall or per download, categories, mirrors and numbered series.' },
          { title: 'More than plain files', text: 'FTP, HLS and DASH web video, and BitTorrent.' },
          { title: 'Its own browser extension', text: 'For Chrome, Edge, Brave and Firefox. Large downloads go to Pullwell; when it is not running, the browser downloads as usual.' },
          { title: 'One file, no installer', text: 'No administrator prompt. It updates itself, checks each update against its fingerprint, and can go back to the previous version.' },
          { title: 'Nothing phones home', text: 'No telemetry. Settings and the download list sit in a folder next to the program.' },
        ] },
      { type: 'gallery', title: 'A look inside', note: 'The previews use sample downloads.', items: [
          { src: 'pullwell/desktop-light.webp', w: 1280, h: 800, alt: 'Pullwell main window in light mode.', caption: 'The main window: categories, queues and a sortable list.' },
          { src: 'pullwell/progress-light.webp', w: 1280, h: 800, alt: 'Pullwell progress view for one download.', caption: 'One download up close: speed, time left, connections and the parts of the file.' },
          { src: 'pullwell/options-light.webp', w: 1280, h: 800, alt: 'Pullwell options window.', caption: 'Options.' },
          { src: 'pullwell/popout-dark.webp', w: 640, h: 640, alt: 'A small separate progress window in dark mode.', caption: 'Progress in its own window. Closing it leaves the download running.' },
          { src: 'pullwell/extension-light.webp', w: 350, h: 596, alt: 'The Pullwell browser extension popup.', caption: 'The browser extension.' },
        ] },
      { type: 'limits', title: 'Honest limits', items: [
          '"Pullwell" is a working name and may change after a trademark check.',
          'These are the first public versions. They are in daily use, and rough edges are likely.',
          'The program is not code-signed yet, so Windows asks you to confirm the first run.',
        ] },
      { type: 'compat', title: 'What you need', rows: [
          ['Runs on', 'Windows 10 and 11'],
          ['Needs', 'Microsoft Edge WebView2, which is part of Windows'],
          ['Licence', 'MIT'],
        ] },
    ],
  },

  {
    slug: 'ai-cv-studio',
    name: 'AI CV Studio',
    tagline: 'Your CV, redesigned in minutes.',
    summary: 'Upload the CV you have, or answer a few plain questions, and get a professional one you can edit and download as a PDF.',
    category: 'Documents',
    platforms: ['Web'],
    platformNote: 'Any modern browser',
    status: { kind: 'live', label: 'Live' },
    repo: 'AI_CV_Studio_Redesign',
    accent: '#7fb0ff',
    accent2: '#ffd27a',
    featured: true,
    mark: '<path d="M14 9h14l6 6v24H14z"/><circle cx="24" cy="21" r="3.2"/><path d="M18.5 32c0-5 11-5 11 0"/>',
    cover: { wall: ['atelier', 'vivid', 'clarity', 'meridian'] },
    hero: 'split',
    actions: [
      { label: 'Open aicvstudio.app', href: 'https://aicvstudio.app', kind: 'open' },
      { label: 'Source on GitHub', href: gh + 'AI_CV_Studio_Redesign' },
    ],
    sections: [
      { type: 'problem', eyebrow: 'The problem', title: 'Good experience, hidden behind a tired document.',
        body: [
          'Most people have a CV somewhere: a PDF from years ago, a Word file, sometimes only a printout. Starting again from a blank template is the part nobody enjoys.',
          'AI CV Studio takes what you already have, including a photo of a paper CV, or asks a few plain questions if you have nothing. You pick a look, adjust it, and download a PDF.',
        ] },
      { type: 'wall', title: 'Designs to start from', note: 'Template previews with sample data.', items: [
          ['atelier', 'Atelier'], ['vivid', 'Vivid'], ['clarity', 'Clarity'], ['meridian', 'Meridian'],
          ['heritage', 'Heritage'], ['folio', 'Folio'], ['halo', 'Halo'], ['ledger', 'Ledger'],
        ] },
      { type: 'features', layout: 'grid', title: 'What it does', items: [
          { title: 'Starts from your CV', text: 'Upload a PDF, a Word file or a photo of a printed page.' },
          { title: 'Or from a conversation', text: 'Say what kind of work you do and answer a few questions in plain language.' },
          { title: 'Writing help that does not invent', text: 'It improves your wording. It does not add jobs, dates, qualifications or numbers you did not give it.' },
          { title: 'Yours to change', text: 'Switch the design, colours and fonts, and edit any line.' },
          { title: 'Readable by hiring software', text: 'The designs keep real text in the PDF, so applicant tracking systems can read it.' },
          { title: 'Saved where you are', text: 'Drafts stay in your browser, with a backup file you can download.' },
        ] },
      { type: 'compat', title: 'What you need', rows: [
          ['Runs on', 'Any modern browser'],
          ['Install', 'Nothing to install'],
          ['Address', 'aicvstudio.app'],
        ] },
    ],
  },

  {
    slug: 'clearwrite',
    name: 'ClearWrite',
    tagline: 'A proofreader that stays on your PC.',
    summary: 'Checks spelling and grammar as you write in your usual Windows apps, on your own computer, with no account and no internet connection.',
    category: 'Writing',
    platforms: ['Windows'],
    platformNote: 'Windows',
    status: { kind: 'beta', label: 'Beta' },
    version: '0.2.0-beta.8',
    repo: 'ClearWrite',
    prerelease: true,
    accent: '#a5b4ff',
    accent2: '#ff9d9d',
    mark: '<path d="M12 15h20M12 22h15M12 29h8"/><path d="M24 31l4.5 4.5L37 26"/>',
    cover: { art: 'clearwrite' },
    hero: 'split',
    actions: [
      { label: 'Download the beta', href: gh + 'ClearWrite/releases', kind: 'download' },
      { label: 'Source on GitHub', href: gh + 'ClearWrite' },
    ],
    sections: [
      { type: 'problem', eyebrow: 'The problem', title: 'Help with your writing should not need your writing sent away.',
        body: [
          'Most writing assistants send what you type to a server. That is a lot of trust for a spelling check.',
          'ClearWrite does the checking on your own computer by default. It needs no account, no key and no connection. Help from an AI service is there if you decide to switch it on, and only then.',
        ] },
      { type: 'modes', title: 'Two modes, and you choose', left: {
          name: 'Offline only', tag: 'The default',
          points: ['Spelling and grammar are checked on your device', 'Nothing you write is sent anywhere', 'Works with no internet connection'] },
        right: {
          name: 'AI-assisted', tag: 'Only if you switch it on',
          points: ['Rephrase, change tone, continue, suggest a reply', 'Uses your own Gemini key or your ChatGPT plan', 'Only the paragraphs that changed are sent, after you pause'] } },
      { type: 'features', layout: 'grid', title: 'What it does', items: [
          { title: 'Underlines where you type', text: 'Red for spelling, blue for grammar, green for things it learned from you.' },
          { title: 'Never changes text by itself', text: 'You accept each fix. A change that alters a number, a name or a "not" is flagged before it is applied.' },
          { title: 'Learns your habits', text: 'Accept a fix twice and it is offered again. Ignore a suggestion twice and it stays ignored. All of it is stored on your PC.' },
          { title: 'Knows where not to look', text: 'Password fields, address bars and apps you exclude are left alone.' },
          { title: 'One shortcut', text: 'Select text anywhere and press Ctrl+Shift+Space.' },
          { title: 'Your own dictionary', text: 'Add names and unusual words so they are not flagged.' },
        ] },
      { type: 'limits', title: 'Honest limits', items: [
          'It is a beta. Expect changes between versions.',
          'Checking is for English.',
          'It does not read the conversation around your text. To get a suggested reply, you select the message yourself.',
        ] },
      { type: 'compat', title: 'What you need', rows: [
          ['Runs on', 'Windows'],
          ['Offline checker', 'Harper, plus a small grammar model that ships with the app'],
          ['AI providers', 'Optional: Google Gemini or ChatGPT'],
          ['Licence', 'MIT'],
        ] },
    ],
  },

  {
    slug: 'vox',
    name: 'Vox',
    tagline: 'Say it. Your PC does it.',
    summary: 'A voice assistant that runs your Windows 11 PC: say what you want, it does it, and it tells you what it did.',
    category: 'Voice',
    platforms: ['Windows'],
    platformNote: 'Windows 11',
    status: { kind: 'early', label: 'Early releases' },
    version: '0.4.3',
    repo: 'Vox',
    accent: '#ff9472',
    accent2: '#ffd36e',
    mark: '<rect x="19" y="9" width="10" height="18" rx="5"/><path d="M13 23a11 11 0 0 0 22 0M24 34v5"/>',
    cover: { art: 'vox' },
    hero: 'split',
    actions: [
      { label: 'Download for Windows', href: gh + 'Vox/releases/latest', kind: 'download' },
      { label: 'Source on GitHub', href: gh + 'Vox' },
    ],
    sections: [
      { type: 'say', title: 'Things you can say', items: [
          'Open YouTube in Chrome and search for lofi beats',
          'Create a folder on the desktop and move everything not opened in 20 days into it',
          'How much disk space is left?',
          'Open Notepad and keep writing what I say',
          'Undo that',
        ] },
      { type: 'problem', eyebrow: 'The idea', title: 'A computer that listens like a person would.',
        body: [
          'Say "Hi Vox", or press Ctrl+Alt+Space, and ask in your own words. Vox hears the whole request, does every part of it, and answers briefly.',
          'It asks before deleting, shutting down, reorganising a folder or running PowerShell. Files are moved, never overwritten, and "Undo that" puts them back.',
        ] },
      { type: 'routes', title: 'Why it is fast, and gets faster', note: 'Vox tries the cheapest route first, and shows which one each command took.', items: [
          { name: 'Instant', when: 'Everyday commands: open a program or a site, search, volume, media, lock, screenshot, undo.', cost: 'No AI request' },
          { name: 'Learned', when: 'Anything the AI has planned for you before, and close variations of it.', cost: 'No AI request' },
          { name: 'AI', when: 'Everything else. The model returns every step at once.', cost: 'One request' },
        ] },
      { type: 'limits', title: 'Honest limits', items: [
          'You bring your own Gemini or OpenAI API key.',
          'While standby is on, speech near the PC is sent to your AI provider to listen for "Hi Vox". A setting keeps that check on the PC instead.',
          'Microphone capture, the hotkey, spoken replies and standby cannot be tested on build machines, so they are only checked on real PCs.',
          'The installer is not code-signed yet, so Windows asks you to confirm the first run.',
        ] },
      { type: 'compat', title: 'What you need', rows: [
          ['Runs on', 'Windows 11'],
          ['Needs', 'A microphone, and a Gemini or OpenAI API key'],
          ['Your data', 'Keys, settings and learned commands stay on your PC'],
        ] },
    ],
  },
];

// Small things in progress that do not have their own page yet.
export const lab = [
  { name: 'NetMerge for Android', text: 'Wi-Fi and mobile data at the same time on a phone. Working test builds, not released.', href: '/products/netmerge/#bench' },
  { name: 'A lighter engine for NetMerge', text: 'NetMerge carries its own smaller network engine. You can try it under Settings while the proven one stays the default.', href: '/products/netmerge/' },
  { name: 'A final name for Pullwell', text: '"Pullwell" is a working name, waiting on a trademark check.', href: '/products/pullwell/' },
];
